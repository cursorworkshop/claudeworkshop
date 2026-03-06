#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..');

const getArgValue = (name, fallback) => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const toNumber = (value, fallback, { min = null, max = null } = {}) => {
  const parsed = Number.parseFloat(String(value));
  if (!Number.isFinite(parsed)) return fallback;
  if (min != null && parsed < min) return min;
  if (max != null && parsed > max) return max;
  return parsed;
};

const openAiKey = process.env.OPENAI_API_KEY || '';
const openAiBaseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const textModel = process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini';
const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const reviewModel = process.env.OPENAI_IMAGE_REVIEW_MODEL || 'gpt-4.1-mini';
const requestTimeoutMs = Math.max(
  10_000,
  Number.parseInt(process.env.OPENAI_IMAGE_REQUEST_TIMEOUT_MS || '240000', 10) || 240_000
);

const styleTemplatePath = path.resolve(
  getArgValue(
    '--style-template',
    path.join(PROJECT_ROOT, 'docs', 'nautilus', 'examples', 'image-style', 'style-template.json')
  )
);

if (!fs.existsSync(styleTemplatePath)) {
  throw new Error(`Style template not found: ${styleTemplatePath}`);
}

const styleTemplate = JSON.parse(fs.readFileSync(styleTemplatePath, 'utf8'));
const thresholds = styleTemplate.quality_thresholds || {};
const compositionLock = styleTemplate.composition_lock || {};

const subjectScale = toNumber(
  getArgValue('--subject-scale', compositionLock.subject_scale_target ?? '0.28'),
  0.28,
  { min: 0.2, max: 0.45 }
);
const negativeSpace = toNumber(
  getArgValue('--negative-space', compositionLock.negative_space_target ?? '0.55'),
  0.55,
  { min: 0.35, max: 0.7 }
);
const diversityMin = toNumber(
  getArgValue('--diversity-min', thresholds.diversity_score_min ?? '0.70'),
  0.7,
  { min: 0.4, max: 0.95 }
);
const styleScoreMin = Math.max(
  1,
  Math.min(100, Number.parseInt(getArgValue('--style-min-score', thresholds.style_score_min ?? '96'), 10) || 96)
);
const compositionScoreMin = Math.max(
  1,
  Math.min(
    100,
    Number.parseInt(getArgValue('--composition-min-score', thresholds.composition_score_min ?? '94'), 10) || 94
  )
);
const maxStyleAttempts = Math.max(
  1,
  Number.parseInt(getArgValue('--max-style-attempts', thresholds.max_style_attempts ?? '8'), 10) || 8
);
const maxDiversityRepairsPerVariant = Math.max(
  1,
  Number.parseInt(
    getArgValue('--max-diversity-repairs-per-variant', thresholds.max_diversity_repairs_per_variant ?? '3'),
    10
  ) || 3
);
const allowBestOnFail = String(getArgValue('--allow-best-on-fail', 'false')).trim().toLowerCase() === 'true';

const countPerArticle = Math.max(
  1,
  Math.min(5, Number.parseInt(getArgValue('--count-per-article', '1'), 10) || 1)
);
const useReferenceEdit = String(getArgValue('--use-reference-edit', 'true')).trim().toLowerCase() !== 'false';
const outputDir = path.resolve(
  getArgValue('--output-dir', path.join(PROJECT_ROOT, 'docs', 'nautilus', 'data', 'image-candidates'))
);

const defaultArticles = [
  'content/editorials/mcp-and-integrations-1961848171925278932.mdx',
  'content/editorials/multi-agent-orchestration-2019564738649505882.mdx',
  'content/editorials/ai-coding-tooling-1977706278110765481.mdx',
];
const articlePaths = String(getArgValue('--articles', defaultArticles.join(',')))
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(value => path.resolve(PROJECT_ROOT, value));

if (!openAiKey) {
  throw new Error('OPENAI_API_KEY is required.');
}

const referencePath = path.resolve(
  PROJECT_ROOT,
  styleTemplate?.canonical_reference?.path ||
    path.join('docs', 'nautilus', 'examples', 'image-style', 'target-style-reference.png')
);
const styleReferenceBuffer = fs.existsSync(referencePath) ? fs.readFileSync(referencePath) : null;

const fetchWithTimeout = async (url, options = {}, timeoutMs = requestTimeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const parseFrontmatter = text => {
  const match = String(text || '').match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: {}, body: text };
  }

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const parts = line.split(':');
    if (parts.length < 2) continue;
    const key = parts.shift().trim();
    const value = parts.join(':').trim().replace(/^['"]|['"]$/g, '');
    if (key) frontmatter[key] = value;
  }

  const body = text.slice(match[0].length);
  return { frontmatter, body };
};

const stripMarkdown = value =>
  String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const slugify = input =>
  String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const hashString = input => {
  let h = 0;
  const value = String(input || '');
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const SCENE_CONTEXT_TYPES = ['workspace', 'artifact_focus', 'workflow_moment'];
const SCENE_CONTEXT_CYCLE = ['artifact_focus', 'workflow_moment', 'workspace'];

const parseJsonLoose = input => {
  const value = String(input || '').trim();
  const cleaned = value.startsWith('```')
    ? value.replace(/^```[a-zA-Z0-9]*\n?/, '').replace(/\n?```$/, '').trim()
    : value;
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON.');
    return JSON.parse(match[0]);
  }
};

const chatJson = async ({ systemPrompt, userPrompt, model = textModel, temperature = 0.2 }) => {
  const response = await fetchWithTimeout(
    `${openAiBaseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    },
    requestTimeoutMs
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI chat failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI chat returned empty content.');
  return parseJsonLoose(content);
};

const chatJsonWithImages = async ({
  systemPrompt,
  userPrompt,
  imageDataUris = [],
  model = reviewModel,
  temperature = 0.1,
}) => {
  const content = [{ type: 'text', text: userPrompt }];
  for (const uri of imageDataUris) {
    content.push({
      type: 'image_url',
      image_url: { url: uri },
    });
  }

  const response = await fetchWithTimeout(
    `${openAiBaseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content },
        ],
      }),
    },
    requestTimeoutMs
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI multimodal chat failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('OpenAI multimodal chat returned empty content.');
  return parseJsonLoose(raw);
};

const payloadToImageBuffer = async payload => {
  const first = payload?.data?.[0];
  if (first?.b64_json) {
    return Buffer.from(first.b64_json, 'base64');
  }
  if (first?.url) {
    const response = await fetchWithTimeout(first.url, {}, requestTimeoutMs);
    if (!response.ok) {
      throw new Error(`Failed to fetch image URL (${response.status}).`);
    }
    const arr = await response.arrayBuffer();
    return Buffer.from(arr);
  }
  throw new Error('Image response missing b64_json/url.');
};

const generateImage = async prompt => {
  if (useReferenceEdit && styleReferenceBuffer) {
    const form = new FormData();
    form.append('model', imageModel);
    form.append('prompt', prompt);
    form.append('size', '1536x1024');
    form.append('image', new Blob([styleReferenceBuffer], { type: 'image/png' }), 'reference.png');

    const editResponse = await fetchWithTimeout(
      `${openAiBaseUrl}/images/edits`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${openAiKey}`,
        },
        body: form,
      },
      requestTimeoutMs
    );

    if (editResponse.ok) {
      return payloadToImageBuffer(await editResponse.json());
    }
  }

  const genResponse = await fetchWithTimeout(
    `${openAiBaseUrl}/images/generations`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: imageModel,
        prompt,
        size: '1536x1024',
      }),
    },
    requestTimeoutMs
  );

  if (!genResponse.ok) {
    const body = await genResponse.text();
    throw new Error(`OpenAI image generation failed (${genResponse.status}): ${body.slice(0, 500)}`);
  }

  return payloadToImageBuffer(await genResponse.json());
};

const imageBufferToDataUri = buffer => `data:image/png;base64,${buffer.toString('base64')}`;

const buildStyleBlock = () => {
  const linework = Array.isArray(styleTemplate?.style_dna?.linework) ? styleTemplate.style_dna.linework : [];
  const hatching = Array.isArray(styleTemplate?.style_dna?.hatching) ? styleTemplate.style_dna.hatching : [];
  const tone = Array.isArray(styleTemplate?.style_dna?.tone) ? styleTemplate.style_dna.tone : [];
  const hardNegatives = Array.isArray(styleTemplate?.hard_negatives) ? styleTemplate.hard_negatives : [];

  return [
    'Style lock: match the canonical editorial sketch style exactly (line character + mood + roughness), not fixed desk composition.',
    `Linework lock: ${linework.join(', ') || 'scratchy rough pen lines'}.`,
    `Hatching lock: ${hatching.join(', ') || 'local low-density hatching only'}.`,
    `Tone lock: ${tone.join(', ') || 'soft pastel paper tone and subtle gradient'}.`,
    `Hard negatives: ${hardNegatives.join(', ') || 'no logos, no extra people, no polished rendering'}.`,
  ]
    .filter(Boolean)
    .join(' ');
};

const compositionVariants = [
  'Pulled-back framing with broad empty paper around a single focal object.',
  'Asymmetric composition with the focal subject off-center and large negative space.',
  'Top-down editorial angle emphasizing shape language over literal UI detail.',
  'Minimal scene staging with one dominant artifact and sparse supporting marks.',
  'Wide breathing-room framing with compact subject and simple background cues.',
];

const pickCompositionVariant = seed => compositionVariants[hashString(seed) % compositionVariants.length];

const extractSceneBriefs = async ({ articlePath, title, description, summary, count = 3 }) => {
  const userPrompt = `
Extract ${count} scene briefs for hero image generation from this technical article.

Article path: ${articlePath}
Title: ${title}
Description: ${description}
Summary: ${summary}

Requirements:
- Create grounded scenes directly tied to article substance.
- Each scene must use a DISTINCT context_type from this set: workspace, artifact_focus, workflow_moment.
- Do NOT default all scenes to "person behind computer".
- At least one scene must be non-human (no visible person).
- At least one scene should focus on an artifact or system moment rather than a desk portrait.
- For artifact_focus, explicitly avoid visible humans.
- For workflow_moment, avoid dominant human portrait framing.
- Prefer abstract, conceptual, high-level scenes over literal UI depictions.
- No text in scene concepts: avoid words, labels, letters, numbers, or title banners inside visuals.
- Hard device ban in scene concepts: no computers, monitors, laptops, screens, phones, tablets, browser windows, terminal windows, or dashboards.
- Avoid generic buzzword visuals.
- Keep each scene short, specific, and concrete.

Return JSON with this exact schema:
{
  "sceneBriefs": [
    {
      "id": "scene-1",
      "context_type": "workspace|artifact_focus|workflow_moment",
      "headline": "short label",
      "scene": "one concise visual scene description",
      "article_grounding": "what in the article this scene reflects"
    }
  ]
}
`;

  const result = await chatJson({
    systemPrompt:
      'You create concrete editorial art briefs from technical writing. Be specific and avoid visual cliches.',
    userPrompt,
    model: textModel,
    temperature: 0.25,
  });

  const items = Array.isArray(result.sceneBriefs) ? result.sceneBriefs : [];
  const allowed = new Set(SCENE_CONTEXT_TYPES);
  const normalized = [];

  for (let idx = 0; idx < items.length; idx += 1) {
    const raw = items[idx] || {};
    const contextType = allowed.has(String(raw.context_type || '').trim())
      ? String(raw.context_type).trim()
      : SCENE_CONTEXT_TYPES[idx % SCENE_CONTEXT_TYPES.length];
    const scene = String(raw.scene || '').trim();
    if (!scene) continue;

    normalized.push({
      id: String(raw.id || `scene-${idx + 1}`),
      context_type: contextType,
      headline: String(raw.headline || `Scene ${idx + 1}`).trim(),
      scene,
      article_grounding: String(raw.article_grounding || '').trim(),
    });
  }

  const fallbackScenes = [
    {
      id: 'scene-workspace',
      context_type: 'workspace',
      headline: 'Execution Workspace',
      scene:
        'An abstract tabletop composition with blank index cards, thread-like connectors, and geometric tokens, with airy negative space and no digital devices.',
      article_grounding: 'Represents the implementation environment discussed in the article.',
    },
    {
      id: 'scene-artifact',
      context_type: 'artifact_focus',
      headline: 'Artifact Focus',
      scene:
        'A non-human artifact tableau of symbolic modules, cables, and stacked physical fragments arranged as one focal composition; no screens or labels.',
      article_grounding: 'Represents concrete technical artifacts and outputs in the article.',
    },
    {
      id: 'scene-workflow',
      context_type: 'workflow_moment',
      headline: 'Workflow Moment',
      scene:
        'A workflow transition moment depicted with abstract state shapes, rhythm marks, and relay-like physical tokens, minimal and conceptual; no digital devices.',
      article_grounding: 'Represents step-by-step workflow decisions described in the article.',
    },
  ];

  const byType = new Map();
  for (const item of normalized) {
    if (!byType.has(item.context_type)) {
      byType.set(item.context_type, item);
    }
  }

  const anchoredByType = SCENE_CONTEXT_CYCLE.map(type => {
    const preferred = byType.get(type);
    const fallback = fallbackScenes.find(scene => scene.context_type === type);
    return preferred || fallback;
  }).filter(Boolean);

  const constrained = anchoredByType.map(item => {
    const scene = String(item.scene || '');
    const humanHeavy = /\b(developer|engineer|person|human|worker)\b/i.test(scene);
    const textHeavy = /\b(text|label|labels|title|banner|words|letters|numbers|readable|caption)\b/i.test(scene);
    const deviceHeavy =
      /\b(computer|monitor|screen|laptop|desktop|browser|terminal|dashboard|window|ui|display|tablet|phone)\b/i.test(
        scene
      );
    if (item.context_type === 'artifact_focus' && humanHeavy) {
      return fallbackScenes.find(s => s.context_type === 'artifact_focus') || item;
    }
    if (item.context_type === 'workflow_moment' && humanHeavy) {
      return fallbackScenes.find(s => s.context_type === 'workflow_moment') || item;
    }
    if (textHeavy) {
      return fallbackScenes.find(s => s.context_type === item.context_type) || item;
    }
    if (deviceHeavy) {
      return fallbackScenes.find(s => s.context_type === item.context_type) || item;
    }
    return item;
  });

  const hasNonHuman = constrained.some(
    item => !/\b(developer|engineer|person|human|worker)\b/i.test(String(item.scene || ''))
  );
  if (!hasNonHuman) {
    constrained[0] = fallbackScenes.find(s => s.context_type === 'artifact_focus') || constrained[0];
  }

  const selected = [...constrained];
  const seenIds = new Set(selected.map(item => item.id));
  for (const item of normalized) {
    if (selected.length >= count) break;
    if (seenIds.has(item.id)) continue;
    selected.push(item);
    seenIds.add(item.id);
  }

  let fallbackIndex = 0;
  while (selected.length < count) {
    const type = SCENE_CONTEXT_CYCLE[fallbackIndex % SCENE_CONTEXT_CYCLE.length];
    selected.push(fallbackScenes.find(scene => scene.context_type === type) || fallbackScenes[0]);
    fallbackIndex += 1;
  }

  return selected.slice(0, count);
};

const buildPrompt = ({ title, description, summary, articlePath, variantIndex, sceneBrief, diversityGuidance }) => {
  const styleBlock = buildStyleBlock();
  const subjectPct = Math.round(subjectScale * 100);
  const negPct = Math.round(negativeSpace * 100);
  const compositionVariant = pickCompositionVariant(`${articlePath}-${variantIndex}-${sceneBrief?.id || title}`);

  return [
    'Create a 16:9 editorial hero illustration for a technical research article.',
    styleBlock,
    'Composition lock: one clear focal subject or object; human is optional.',
    'Anti-trope lock: avoid defaulting to a person behind a computer.',
    'Abstraction lock: favor conceptual symbolic forms and high-level visual metaphors instead of literal UI screenshots.',
    'Hard device ban: no computers, monitors, laptops, screens, phones, tablets, browser windows, terminal windows, dashboards, or literal UI panels.',
    `Subject scale lock: keep focal subject around ${subjectPct}% of canvas (small, not dominant).`,
    `Negative-space lock: keep roughly ${negPct}% empty paper/desk/background visible.`,
    'No logos, no branding, no decorative overlays, no arrows/icons/callouts.',
    'Hard text ban: no readable text, no words, no letters, no numbers, no labels anywhere in the image.',
    'Render the concept through physical/symbolic shapes only; avoid digital interfaces as focal elements.',
    `Article source path (semantic context only, do not render any text): ${articlePath}`,
    `Article title context (semantic only, never render as words): ${title}`,
    description ? `Article description context (semantic only, no literal text rendering): ${description}` : '',
    summary ? `Article summary context (semantic only, no literal text rendering): ${summary}` : '',
    sceneBrief ? `Scene brief (${sceneBrief.context_type}): ${sceneBrief.scene}` : '',
    sceneBrief?.article_grounding ? `Scene grounding: ${sceneBrief.article_grounding}` : '',
    sceneBrief?.context_type === 'artifact_focus'
      ? 'Human lock for artifact_focus: no visible person; center composition on technical artifacts.'
      : '',
    sceneBrief?.context_type === 'workflow_moment'
      ? 'Human lock for workflow_moment: no dominant person portrait; depict workflow state transition via artifacts/marks.'
      : '',
    `Composition variant: ${compositionVariant}`,
    diversityGuidance ? `Diversity guidance for this retry: ${diversityGuidance}` : '',
    `Variant index: ${variantIndex}`,
  ]
    .filter(Boolean)
    .join('\n\n');
};

const evaluateStyleAndComposition = async ({ imageBuffer, sceneBrief, prompt }) => {
  const imageUris = [imageBufferToDataUri(imageBuffer)];
  if (styleReferenceBuffer) {
    imageUris.push(imageBufferToDataUri(styleReferenceBuffer));
  }

  const userPrompt = `
Evaluate the FIRST image (candidate) against style and composition requirements.
If a SECOND image is provided, it is the canonical reference style.

Template summary:
${JSON.stringify(styleTemplate, null, 2)}

Target numeric constraints:
- style_score_min: ${styleScoreMin}
- composition_score_min: ${compositionScoreMin}
- subject_scale_target: ${subjectScale}
- negative_space_target: ${negativeSpace}

Scene brief:
${sceneBrief ? JSON.stringify(sceneBrief, null, 2) : 'N/A'}

Prompt used:
${prompt}

Return strict JSON:
{
  "styleScore": 0,
  "compositionScore": 0,
  "pass": false,
  "hardFails": ["..."],
  "issues": ["..."],
  "retryPromptAddendum": "..."
}

Scoring guidance:
- styleScore measures similarity of line quality, roughness, tonal mood, and style DNA.
- compositionScore measures focal clarity, scene distinctness from desk-trope defaults, abstraction quality, subject scale, and negative space targets.
- If scene brief context_type is artifact_focus, visible human figures are a hard fail.
- If scene brief context_type is workflow_moment, a dominant person portrait is a hard fail.
- Any readable text, letters, words, labels, or numbers in the image is a hard fail.
- Any visible computer/monitor/screen/laptop/browser/terminal/UI dashboard in the image is a hard fail.
- Literal screenshot-like UI or title-like banners should strongly reduce composition score.
- pass is true only if hardFails is empty AND styleScore >= ${styleScoreMin} AND compositionScore >= ${compositionScoreMin}.
`;

  const review = await chatJsonWithImages({
    systemPrompt: 'You are a strict editorial art QA reviewer. Return JSON only.',
    userPrompt,
    imageDataUris: imageUris,
    model: reviewModel,
    temperature: 0.1,
  });

  const styleScore = Math.max(0, Math.min(100, Number.parseInt(String(review.styleScore ?? 0), 10) || 0));
  const compositionScore = Math.max(
    0,
    Math.min(100, Number.parseInt(String(review.compositionScore ?? 0), 10) || 0)
  );
  const hardFails = Array.isArray(review.hardFails)
    ? review.hardFails.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const issues = Array.isArray(review.issues)
    ? review.issues.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const retryPromptAddendum = String(review.retryPromptAddendum || '').trim();

  const pass = hardFails.length === 0 && styleScore >= styleScoreMin && compositionScore >= compositionScoreMin;

  return {
    styleScore,
    compositionScore,
    pass,
    hardFails,
    issues,
    retryPromptAddendum,
  };
};

const evaluatePairDiversity = async ({ imageA, imageB, sceneA, sceneB, idxA, idxB }) => {
  const userPrompt = `
Compare image A and image B.

Goal:
- Keep shared style DNA constant.
- Ensure scene/content/composition are meaningfully different.

Diversity threshold:
- minimum acceptable diversityScore: ${diversityMin}

Scene brief A:
${JSON.stringify(sceneA, null, 2)}

Scene brief B:
${JSON.stringify(sceneB, null, 2)}

Return strict JSON:
{
  "diversityScore": 0.0,
  "pass": false,
  "issues": ["..."],
  "regenerateTarget": "A|B",
  "retryPromptAddendum": "instruction for whichever target should be regenerated"
}

Rules:
- diversityScore range is 0.0 to 1.0.
- pass is true if diversityScore >= ${diversityMin}.
- If both images default to the same trope (for example, person-behind-computer in both), score <= 0.45 and fail.
- If context_type differs but visuals still look like the same scene template, fail and require regeneration.
- If fail, choose a regeneration target (prefer B unless A is the clear duplicate).
`;

  const review = await chatJsonWithImages({
    systemPrompt:
      'You evaluate compositional and semantic diversity between two style-matched editorial images. Return JSON only.',
    userPrompt,
    imageDataUris: [imageBufferToDataUri(imageA), imageBufferToDataUri(imageB)],
    model: reviewModel,
    temperature: 0.1,
  });

  const diversityScoreRaw = toNumber(review.diversityScore, 0, { min: 0, max: 1 });
  const issues = Array.isArray(review.issues)
    ? review.issues.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const regenerateTarget = String(review.regenerateTarget || 'B').trim().toUpperCase() === 'A' ? idxA : idxB;
  const retryPromptAddendum = String(review.retryPromptAddendum || '').trim();
  const pass = diversityScoreRaw >= diversityMin;

  return {
    diversityScore: Number(diversityScoreRaw.toFixed(3)),
    pass,
    issues,
    regenerateTarget,
    retryPromptAddendum,
  };
};

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.join(outputDir, stamp);
fs.mkdirSync(runDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  models: {
    image: imageModel,
    sceneExtractor: textModel,
    reviewer: reviewModel,
  },
  config: {
    useReferenceEdit,
    styleTemplate: path.relative(PROJECT_ROOT, styleTemplatePath),
    subjectScale,
    negativeSpace,
    diversityMin,
    styleScoreMin,
    compositionScoreMin,
    maxStyleAttempts,
    maxDiversityRepairsPerVariant,
    allowBestOnFail,
    countPerArticle,
  },
  articles: [],
};

for (const [articleIndex, articlePath] of articlePaths.entries()) {
  if (!fs.existsSync(articlePath)) {
    console.warn(`Skipping missing article: ${articlePath}`);
    continue;
  }

  const mdx = fs.readFileSync(articlePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(mdx);
  const title = frontmatter.title || path.basename(articlePath, path.extname(articlePath));
  const description = frontmatter.description || '';
  const summary = stripMarkdown(body).slice(0, 900);
  const articleRel = path.relative(PROJECT_ROOT, articlePath);
  const articleSlug = slugify(path.basename(articlePath, '.mdx'));
  const articleDir = path.join(runDir, articleSlug);
  fs.mkdirSync(articleDir, { recursive: true });

  const sceneBriefs = await extractSceneBriefs({
    articlePath: articleRel,
    title,
    description,
    summary,
    count: Math.max(3, countPerArticle),
  });

  fs.writeFileSync(path.join(articleDir, 'scene-briefs.json'), `${JSON.stringify(sceneBriefs, null, 2)}\n`, 'utf8');

  const variants = [];

  const generateVariant = async ({ index, sceneBrief, diversityGuidance = '' }) => {
    let retryGuidance = diversityGuidance;
    const attemptHistory = [];
    let bestFallback = null;

    for (let attempt = 1; attempt <= maxStyleAttempts; attempt += 1) {
      const prompt = buildPrompt({
        title,
        description,
        summary,
        articlePath: articleRel,
        variantIndex: index,
        sceneBrief,
        diversityGuidance: retryGuidance,
      });

      const imageBuffer = await generateImage(prompt);
      const review = await evaluateStyleAndComposition({
        imageBuffer,
        sceneBrief,
        prompt,
      });

      attemptHistory.push({
        attempt,
        style_score: review.styleScore,
        composition_score: review.compositionScore,
        pass: review.pass,
        hard_fails: review.hardFails,
        issues: review.issues,
        retry_prompt_addendum: review.retryPromptAddendum,
      });

      const fallbackScore =
        (review.hardFails.length === 0 ? 10_000 : 0) + review.styleScore * 100 + review.compositionScore;
      if (!bestFallback || fallbackScore > bestFallback.fallbackScore) {
        bestFallback = {
          fallbackScore,
          index,
          scene_brief: sceneBrief,
          prompt,
          imageBuffer,
          style_score: review.styleScore,
          composition_score: review.compositionScore,
          review,
          attemptHistory: [...attemptHistory],
          qa_soft_fail: !review.pass,
        };
      }

      if (review.pass) {
        return {
          index,
          scene_brief: sceneBrief,
          prompt,
          imageBuffer,
          style_score: review.styleScore,
          composition_score: review.compositionScore,
          review,
          attemptHistory,
          qa_soft_fail: false,
        };
      }

      retryGuidance = [
        retryGuidance,
        review.retryPromptAddendum,
        ...review.hardFails,
        ...review.issues,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    if (allowBestOnFail && bestFallback) {
      console.warn(
        `Variant ${index} returned best fallback after ${maxStyleAttempts} attempts (style=${bestFallback.style_score}, composition=${bestFallback.composition_score}, pass=${bestFallback.review?.pass === true}).`
      );
      return bestFallback;
    }

    const last = attemptHistory[attemptHistory.length - 1] || null;
    throw new Error(
      `Variant ${index} failed style/composition gate after ${maxStyleAttempts} attempts. Last scores: style=${last?.style_score ?? 0}, composition=${last?.composition_score ?? 0}.`
    );
  };

  const sceneTypeRotation = SCENE_CONTEXT_CYCLE.map(
    (_, offset) => SCENE_CONTEXT_CYCLE[(articleIndex + offset) % SCENE_CONTEXT_CYCLE.length]
  );
  const usedSceneIds = new Set();
  for (let idx = 1; idx <= countPerArticle; idx += 1) {
    const preferredType = sceneTypeRotation[(idx - 1) % sceneTypeRotation.length];
    const sceneBrief =
      sceneBriefs.find(item => item.context_type === preferredType && !usedSceneIds.has(item.id)) ||
      sceneBriefs.find(item => !usedSceneIds.has(item.id)) ||
      sceneBriefs[(idx - 1) % sceneBriefs.length];
    usedSceneIds.add(sceneBrief.id);
    const variant = await generateVariant({ index: idx, sceneBrief });
    variants.push({ ...variant, diversity_repairs: 0, diversity_score_vs_others: null });
  }

  const pairwiseReports = [];
  if (variants.length > 1) {
    let guard = 0;
    let stabilized = false;

    while (!stabilized && guard < variants.length * maxDiversityRepairsPerVariant * 4) {
      guard += 1;
      pairwiseReports.length = 0;
      let failingPair = null;

      for (let i = 0; i < variants.length; i += 1) {
        for (let j = i + 1; j < variants.length; j += 1) {
          const va = variants[i];
          const vb = variants[j];
          const diversity = await evaluatePairDiversity({
            imageA: va.imageBuffer,
            imageB: vb.imageBuffer,
            sceneA: va.scene_brief,
            sceneB: vb.scene_brief,
            idxA: i,
            idxB: j,
          });

          pairwiseReports.push({
            pair: [va.index, vb.index],
            diversity_score: diversity.diversityScore,
            pass: diversity.pass,
            issues: diversity.issues,
            regenerate_variant_index: variants[diversity.regenerateTarget].index,
            retry_prompt_addendum: diversity.retryPromptAddendum,
          });

          if (!diversity.pass && !failingPair) {
            failingPair = {
              i,
              j,
              regenerateTarget: diversity.regenerateTarget,
              retryPromptAddendum: diversity.retryPromptAddendum,
              diversityScore: diversity.diversityScore,
            };
          }
        }
      }

      if (!failingPair) {
        stabilized = true;
        break;
      }

      const targetIdx = failingPair.regenerateTarget;
      const targetVariant = variants[targetIdx];
      targetVariant.diversity_repairs += 1;

      if (targetVariant.diversity_repairs > maxDiversityRepairsPerVariant) {
        throw new Error(
          `Variant ${targetVariant.index} exceeded max diversity repairs (${maxDiversityRepairsPerVariant}).`
        );
      }

      const renewed = await generateVariant({
        index: targetVariant.index,
        sceneBrief: targetVariant.scene_brief,
        diversityGuidance: [
          `Diversity failure score=${failingPair.diversityScore}.`,
          failingPair.retryPromptAddendum,
          'Keep the same style DNA but change scene composition and object emphasis to avoid near-duplicate framing.',
        ]
          .filter(Boolean)
          .join(' '),
      });

      variants[targetIdx] = {
        ...renewed,
        diversity_repairs: targetVariant.diversity_repairs,
        diversity_score_vs_others: null,
      };
    }

    if (!stabilized) {
      throw new Error('Diversity QA did not stabilize within guard limit.');
    }

    for (const variant of variants) {
      const scores = pairwiseReports
        .filter(report => report.pair.includes(variant.index))
        .map(report => report.diversity_score);
      variant.diversity_score_vs_others = scores.length
        ? Number(Math.min(...scores).toFixed(3))
        : 1;
    }
  } else if (variants.length === 1) {
    variants[0].diversity_score_vs_others = 1;
  }

  const articleEntry = {
    articlePath: articleRel,
    title,
    description,
    scene_briefs: sceneBriefs,
    variants: [],
    comparison_report: {
      style_consistency_goal: 'Keep canonical style DNA identical while varying scene content.',
      diversity_threshold: diversityMin,
      distinctness_notes: variants.map(variant => ({
        variant_index: variant.index,
        context_type: variant.scene_brief.context_type,
        rationale: `Distinct by context (${variant.scene_brief.context_type}) and scene intent: ${variant.scene_brief.scene}`,
      })),
      pairwise: pairwiseReports,
      summary: {
        pass: pairwiseReports.every(item => item.pass),
        failing_pairs: pairwiseReports.filter(item => !item.pass).map(item => item.pair),
      },
    },
  };

  for (const variant of variants) {
    const variantLabel = String(variant.index).padStart(2, '0');
    const fileName = `variant-${variantLabel}.png`;
    const promptName = `variant-${variantLabel}.prompt.txt`;
    const reviewName = `variant-${variantLabel}.review.json`;
    const sceneName = `variant-${variantLabel}.scene-brief.json`;

    const imagePath = path.join(articleDir, fileName);
    const promptPath = path.join(articleDir, promptName);
    const reviewPath = path.join(articleDir, reviewName);
    const scenePath = path.join(articleDir, sceneName);

    fs.writeFileSync(imagePath, variant.imageBuffer);
    fs.writeFileSync(promptPath, `${variant.prompt}\n`, 'utf8');
    fs.writeFileSync(
      reviewPath,
      `${JSON.stringify(
        {
          style_score: variant.style_score,
          composition_score: variant.composition_score,
          diversity_score_vs_others: variant.diversity_score_vs_others,
          attempt_history: variant.attemptHistory,
          final_review: variant.review,
          diversity_repairs: variant.diversity_repairs,
          qa_soft_fail: variant.qa_soft_fail === true,
        },
        null,
        2
      )}\n`,
      'utf8'
    );
    fs.writeFileSync(scenePath, `${JSON.stringify(variant.scene_brief, null, 2)}\n`, 'utf8');

    articleEntry.variants.push({
      index: variant.index,
      image: path.relative(runDir, imagePath),
      prompt: path.relative(runDir, promptPath),
      review: path.relative(runDir, reviewPath),
      scene_brief_file: path.relative(runDir, scenePath),
      style_score: variant.style_score,
      composition_score: variant.composition_score,
      diversity_score_vs_others: variant.diversity_score_vs_others,
      scene_brief: variant.scene_brief,
      qa_soft_fail: variant.qa_soft_fail === true,
    });

    console.log(`Generated ${path.relative(PROJECT_ROOT, imagePath)}`);
  }

  const comparisonPath = path.join(articleDir, 'comparison-report.json');
  fs.writeFileSync(comparisonPath, `${JSON.stringify(articleEntry.comparison_report, null, 2)}\n`, 'utf8');

  manifest.articles.push(articleEntry);
}

const manifestPath = path.join(runDir, 'manifest.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const latestPath = path.join(outputDir, 'latest-run.json');
fs.writeFileSync(
  latestPath,
  `${JSON.stringify({ runDir: path.relative(PROJECT_ROOT, runDir), generatedAt: new Date().toISOString() }, null, 2)}\n`,
  'utf8'
);

console.log(`Run directory: ${runDir}`);
