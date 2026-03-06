#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

const getArgValue = (name, fallback) => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const hasFlag = name => argv.includes(name);
const toNumber = (value, fallback) => {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const candidateJsonPath = path.resolve(
  getArgValue(
    '--candidate-json',
    path.join(
      PROJECT_ROOT,
      'data',
      'state',
      'X-bookmarks.next-research-candidate.json'
    )
  )
);
const stateDir = path.resolve(
  getArgValue('--state-dir', path.join(PROJECT_ROOT, 'data', 'state'))
);
const outboxDir = path.resolve(
  getArgValue('--outbox-dir', path.join(PROJECT_ROOT, 'data', 'outbox'))
);
const minRelevance = Math.max(
  0,
  Math.min(100, Number.parseInt(getArgValue('--min-relevance', '65'), 10) || 65)
);
const maxDraftAttempts = Math.max(
  1,
  Number.parseInt(getArgValue('--max-draft-attempts', '3'), 10) || 3
);
const minWordCount = Math.max(
  100,
  Number.parseInt(getArgValue('--min-word-count', '450'), 10) || 450
);
const maxWordCount = Math.max(
  minWordCount + 50,
  Number.parseInt(
    getArgValue(
      '--max-word-count',
      process.env.NAUTILUS_MAX_WORD_COUNT || '1100'
    ),
    10
  ) || 1100
);
const targetWordCount = Math.max(
  minWordCount,
  Math.min(
    maxWordCount,
    Number.parseInt(
      getArgValue(
        '--target-word-count',
        process.env.NAUTILUS_TARGET_WORD_COUNT || '900'
      ),
      10
    ) || 900
  )
);
const dryRun = hasFlag('--dry-run');

const openAiKey = process.env.OPENAI_API_KEY || '';
const openAiBaseUrl = (
  process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
).replace(/\/+$/, '');
const textModel = process.env.OPENAI_TEXT_MODEL || 'gpt-4.1';
const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const textInputUsdPer1M = Number.parseFloat(
  process.env.OPENAI_TEXT_INPUT_USD_PER_1M || '2'
);
const textOutputUsdPer1M = Number.parseFloat(
  process.env.OPENAI_TEXT_OUTPUT_USD_PER_1M || '8'
);
const image1536x1024UsdEach = Number.parseFloat(
  process.env.OPENAI_IMAGE_1536X1024_USD_EACH || '0.063'
);
const openAiRequestTimeoutMs = Math.max(
  10_000,
  Number.parseInt(process.env.OPENAI_REQUEST_TIMEOUT_MS || '120000', 10) ||
    120_000
);
const openAiImageRequestTimeoutMs = Math.max(
  openAiRequestTimeoutMs,
  Number.parseInt(
    process.env.OPENAI_IMAGE_REQUEST_TIMEOUT_MS || '180000',
    10
  ) || 180_000
);
const styleTemplatePath = path.resolve(
  getArgValue(
    '--style-template',
    path.join(PROJECT_ROOT, 'examples', 'image-style', 'style-template.json')
  )
);
const styleTemplate = fs.existsSync(styleTemplatePath)
  ? JSON.parse(fs.readFileSync(styleTemplatePath, 'utf8'))
  : {};
const styleTemplateQuality = styleTemplate?.quality_thresholds || {};
const styleTemplateComposition = styleTemplate?.composition_lock || {};
const styleTemplateStyleDna = styleTemplate?.style_dna || {};
const styleTemplateHardNegatives = Array.isArray(styleTemplate?.hard_negatives)
  ? styleTemplate.hard_negatives
  : [];
const imageReviewModel =
  process.env.OPENAI_IMAGE_REVIEW_MODEL || 'gpt-4.1-mini';
const imageMaxAttempts = Math.max(
  1,
  Number.parseInt(
    getArgValue(
      '--image-max-attempts',
      process.env.NAUTILUS_IMAGE_MAX_ATTEMPTS ||
        String(styleTemplateQuality.max_style_attempts || '8')
    ),
    10
  ) || 8
);
const imageMinScore = Math.max(
  1,
  Math.min(
    100,
    Number.parseInt(
      getArgValue(
        '--image-min-score',
        process.env.NAUTILUS_IMAGE_MIN_SCORE ||
          String(styleTemplateQuality.style_score_min || '96')
      ),
      10
    ) || 96
  )
);
const imageCompositionMinScore = Math.max(
  1,
  Math.min(
    100,
    Number.parseInt(
      getArgValue(
        '--image-composition-min-score',
        process.env.NAUTILUS_IMAGE_COMPOSITION_MIN_SCORE ||
          String(styleTemplateQuality.composition_score_min || '94')
      ),
      10
    ) || 94
  )
);
const imageReferencePath = path.join(
  PROJECT_ROOT,
  'examples',
  'image-style',
  'target-style-reference.png'
);
const imageStyleSpecPath = path.join(
  PROJECT_ROOT,
  'examples',
  'image-style',
  'reference-style-spec.md'
);
const imageStyleSpecText = fs.existsSync(imageStyleSpecPath)
  ? fs.readFileSync(imageStyleSpecPath, 'utf8').trim()
  : '';
const subjectScaleTarget = toNumber(
  getArgValue(
    '--subject-scale',
    styleTemplateComposition.subject_scale_target ?? '0.22'
  ),
  0.22
);
const negativeSpaceTarget = toNumber(
  getArgValue(
    '--negative-space',
    styleTemplateComposition.negative_space_target ?? '0.70'
  ),
  0.70
);
const subjectScaleRange =
  Array.isArray(styleTemplateComposition.subject_scale_range) &&
  styleTemplateComposition.subject_scale_range.length === 2
    ? styleTemplateComposition.subject_scale_range
    : [0.16, 0.28];
const negativeSpaceRange =
  Array.isArray(styleTemplateComposition.negative_space_range) &&
  styleTemplateComposition.negative_space_range.length === 2
    ? styleTemplateComposition.negative_space_range
    : [0.6, 0.8];
const styleReferenceImageBuffer = fs.existsSync(imageReferencePath)
  ? fs.readFileSync(imageReferencePath)
  : null;
const preferReferenceEdit =
  (process.env.NAUTILUS_IMAGE_USE_REFERENCE_EDIT || 'true')
    .trim()
    .toLowerCase() !== 'false';

const articleBaseUrl = (
  process.env.RESEARCH_BASE_URL || 'https://www.claudeworkshop.com/research'
).replace(/\/+$/, '');
const authorName = process.env.RESEARCH_AUTHOR_NAME || 'Rogier Muller';
const authorUrl =
  process.env.RESEARCH_AUTHOR_URL || 'https://www.linkedin.com/in/rogyr/';

const usageMetrics = {
  chat_calls: 0,
  chat_prompt_tokens: 0,
  chat_completion_tokens: 0,
  chat_total_tokens: 0,
  image_calls: 0,
  image_prompt_tokens: 0,
  image_total_tokens: 0,
  image_review_calls: 0,
  image_review_passes: 0,
};

if (!openAiKey && !dryRun) {
  throw new Error('OPENAI_API_KEY is required unless --dry-run is used.');
}

const readJson = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeText = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
};

const slugify = input =>
  String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const escapeSingleQuotedYaml = input =>
  String(input || '')
    .replace(/'/g, "''")
    .trim();

const stripCodeFences = input => {
  const value = String(input || '').trim();
  if (value.startsWith('```')) {
    return value
      .replace(/^```[a-zA-Z0-9]*\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
  }
  return value;
};

const parseJsonLoose = input => {
  const cleaned = stripCodeFences(input);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('Model did not return JSON.');
    }
    return JSON.parse(match[0]);
  }
};

const fetchWithTimeout = async (url, options, timeoutMs) => {
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

const accumulateChatUsage = payload => {
  const usage = payload?.usage || {};
  const promptTokens =
    Number(
      usage.prompt_tokens || usage.input_tokens || usage.input_text_tokens || 0
    ) || 0;
  const completionTokens =
    Number(
      usage.completion_tokens ||
        usage.output_tokens ||
        usage.output_text_tokens ||
        0
    ) || 0;
  const totalTokens =
    Number(usage.total_tokens || promptTokens + completionTokens) || 0;

  usageMetrics.chat_calls += 1;
  usageMetrics.chat_prompt_tokens += promptTokens;
  usageMetrics.chat_completion_tokens += completionTokens;
  usageMetrics.chat_total_tokens += totalTokens;
};

const chatJson = async (messages, model = textModel, temperature = 0.35) => {
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
        messages,
      }),
    },
    openAiRequestTimeoutMs
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenAI chat failed (${response.status}): ${body.slice(0, 400)}`
    );
  }

  const payload = await response.json();
  accumulateChatUsage(payload);

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI chat returned empty content.');
  }

  return parseJsonLoose(content);
};

const chatJsonWithImages = async ({
  model = imageReviewModel,
  systemPrompt,
  userText,
  imageDataUris = [],
  temperature = 0.1,
}) => {
  const multimodalContent = [{ type: 'text', text: userText }];
  for (const imageDataUri of imageDataUris) {
    multimodalContent.push({
      type: 'image_url',
      image_url: { url: imageDataUri },
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
          { role: 'user', content: multimodalContent },
        ],
      }),
    },
    openAiRequestTimeoutMs
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenAI multimodal chat failed (${response.status}): ${body.slice(0, 400)}`
    );
  }

  const payload = await response.json();
  accumulateChatUsage(payload);

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI multimodal chat returned empty content.');
  }

  return parseJsonLoose(content);
};

const imageBufferToDataUri = imageBuffer =>
  `data:image/png;base64,${imageBuffer.toString('base64')}`;

const accumulateImageUsage = payload => {
  const usage = payload?.usage || {};
  const promptTokens =
    Number(
      usage.prompt_tokens || usage.input_tokens || usage.input_text_tokens || 0
    ) || 0;
  const totalTokens = Number(usage.total_tokens || promptTokens) || 0;
  usageMetrics.image_calls += 1;
  usageMetrics.image_prompt_tokens += promptTokens;
  usageMetrics.image_total_tokens += totalTokens;
};

const imagePayloadToBuffer = async payload => {
  accumulateImageUsage(payload);

  const image = payload?.data?.[0];
  if (image?.b64_json) {
    return Buffer.from(image.b64_json, 'base64');
  }

  if (image?.url) {
    const imageResponse = await fetchWithTimeout(
      image.url,
      {},
      openAiRequestTimeoutMs
    );
    if (!imageResponse.ok) {
      throw new Error(
        `OpenAI image URL fetch failed (${imageResponse.status}).`
      );
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(imageArrayBuffer);
  }

  throw new Error('OpenAI image response did not include b64_json or url.');
};

const generateImage = async prompt => {
  const response = await fetchWithTimeout(
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
    openAiImageRequestTimeoutMs
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenAI image failed (${response.status}): ${body.slice(0, 400)}`
    );
  }

  const payload = await response.json();
  return imagePayloadToBuffer(payload);
};

const generateImageFromReference = async ({ prompt, referenceBuffer }) => {
  const form = new FormData();
  form.append('model', imageModel);
  form.append('prompt', prompt);
  form.append('size', '1536x1024');
  form.append(
    'image',
    new Blob([referenceBuffer], { type: 'image/png' }),
    'style-reference.png'
  );

  const response = await fetchWithTimeout(
    `${openAiBaseUrl}/images/edits`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${openAiKey}`,
      },
      body: form,
    },
    openAiImageRequestTimeoutMs
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenAI image edit failed (${response.status}): ${body.slice(0, 400)}`
    );
  }

  const payload = await response.json();
  return imagePayloadToBuffer(payload);
};

const normalizeCategory = value => {
  const allowed = new Set([
    'cursor-features',
    'methodology',
    'ai-coding',
    'open-source',
  ]);
  return allowed.has(value) ? value : 'ai-coding';
};

const normalizeTags = tags => {
  if (!Array.isArray(tags)) {
    return [
      'agentic coding',
      'ai coding workflows',
      'engineering productivity',
    ];
  }
  const cleaned = [
    ...new Set(tags.map(t => String(t || '').trim()).filter(Boolean)),
  ];
  return cleaned.slice(0, 8);
};

const sanitizeBody = (body, title) => {
  let value = String(body || '').trim();
  value = value.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
  // Normalize deep heading levels to keep house style (# and ## only).
  value = value.replace(/^#{3,}\s+/gm, '## ');
  if (!value.startsWith('# ')) {
    value = `# ${title}\n\n${value}`;
  }
  return value.trim();
};

const countWords = text =>
  String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const trimMarkdownToWordLimit = (body, maxWords) => {
  const source = String(body || '').trim();
  if (!source) return source;
  if (countWords(source) <= maxWords) return source;

  const blocks = source
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean);

  const kept = [];
  let usedWords = 0;

  for (const block of blocks) {
    const blockWords = countWords(block);
    if (usedWords + blockWords <= maxWords) {
      kept.push(block);
      usedWords += blockWords;
      continue;
    }

    const remaining = maxWords - usedWords;
    if (remaining <= 0) break;

    const sentences = block.split(/(?<=[.!?])\s+/).filter(Boolean);
    const partial = [];
    let partialWords = 0;

    for (const sentence of sentences) {
      const sentenceWords = countWords(sentence);
      if (sentenceWords === 0) continue;
      if (partialWords + sentenceWords > remaining) break;
      partial.push(sentence);
      partialWords += sentenceWords;
    }

    if (partial.length === 0) {
      partial.push(block.split(/\s+/).slice(0, remaining).join(' '));
    }

    kept.push(partial.join(' ').trim());
    break;
  }

  return kept.join('\n\n').trim();
};

const ensureUniqueSlug = (baseSlug, dir) => {
  let slug = baseSlug;
  let idx = 2;
  while (fs.existsSync(path.join(dir, `${slug}.json`))) {
    slug = `${baseSlug}-${idx}`;
    idx += 1;
  }
  return slug;
};

const validateDraft = ({ body, title, description }) => {
  const errors = [];
  const requiredWords = dryRun ? 30 : minWordCount;
  const words = countWords(body);

  if (!title || title.length < 12) {
    errors.push('Title is too short.');
  }
  if (!description || description.length < 40) {
    errors.push('Description is too short.');
  }
  if (/^#{1,2}\s*\d+[.)]\s+/m.test(body)) {
    errors.push(
      'Do not use numbered section headings (for example: ## 1. Heading).'
    );
  }
  if (body.includes('\n### ')) {
    errors.push('Use only # and ## headings. Found ### heading.');
  }
  if (words < requiredWords) {
    errors.push(
      `Article is too short (${words} words). Minimum is ${requiredWords}.`
    );
  }
  if (words > maxWordCount) {
    errors.push(
      `Article is too long (${words} words). Maximum is ${maxWordCount} to keep read time around 5-6 minutes.`
    );
  }
  return errors;
};

const candidate = readJson(candidateJsonPath);

if (candidate.status !== 'ok') {
  console.log('No publishable candidate status. Exiting without changes.');
  process.exit(0);
}

if (Number(candidate.relevance_percent || 0) < minRelevance) {
  console.log(
    `Candidate below threshold (${candidate.relevance_percent} < ${minRelevance}). Skipping.`
  );
  process.exit(0);
}

const slugDateTime = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .slice(0, 13)
  .replace('T', '-');
const slugTopic = slugify(
  candidate.topic ||
    candidate.article_working_title ||
    candidate.candidate_slug ||
    'research'
);
const baseSlug = slugify(`${slugTopic}-${slugDateTime}`);
if (!baseSlug) {
  throw new Error('Could not derive slug from candidate.');
}

const articleDraftSchema = {
  title: 'string',
  description: 'string',
  category: 'cursor-features|methodology|ai-coding|open-source',
  tags: ['string'],
  metaTitle: 'string',
  metaDescription: 'string',
  articleMarkdown: 'string',
  imagePrompt: 'string',
};

const gradientPalettes = [
  { name: 'monochrome white paper', start: '#ffffff', end: '#ffffff' },
];

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

const pickGradientPalette = seed =>
  gradientPalettes[hashString(seed) % gradientPalettes.length];

const styleDnaLinework = Array.isArray(styleTemplateStyleDna.linework)
  ? styleTemplateStyleDna.linework
  : [];
const styleDnaHatching = Array.isArray(styleTemplateStyleDna.hatching)
  ? styleTemplateStyleDna.hatching
  : [];
const styleDnaTone = Array.isArray(styleTemplateStyleDna.tone)
  ? styleTemplateStyleDna.tone
  : [];
const subjectScaleTargetPct = Math.round(subjectScaleTarget * 100);
const negativeSpaceTargetPct = Math.round(negativeSpaceTarget * 100);
const subjectScaleRangePct = subjectScaleRange.map(value =>
  Math.round(value * 100)
);
const negativeSpaceRangePct = negativeSpaceRange.map(value =>
  Math.round(value * 100)
);

const imageStyleGuide = `
Image style requirements:
- 16:9 editorial hero in rough hand-drawn black-pencil sketch style.
- Use one clear focal subject or focal object.
- Human presence is optional.
- Do NOT default to a person behind a computer.
- Prefer abstract, high-level conceptual depictions over literal UI screenshots.
- Hard device ban: no computers, monitors, laptops, screens, phones, tablets, browser windows, terminal windows, dashboards, or literal UI panels.
- Prioritize roughness: jittery strokes, visible construction lines, imperfect perspective.
- Keep linework sketch-first, not polished. Avoid smooth vector-like edges.
- Style DNA linework lock: ${styleDnaLinework.join('; ') || 'scratchy rough pen lines'}.
- Style DNA hatching lock: ${styleDnaHatching.join('; ') || 'local low-density hatching only'}.
- Style DNA tonal lock: ${styleDnaTone.join('; ') || 'pure white paper background, no gradient, monochrome only'}.
- Background must be plain white paper (or near-white), with no color wash and no gradient.
- Monochrome lock: black pencil/graphite marks only; no color accents, no colored fills.
- Avoid computers/monitors/screens entirely unless explicitly required by future override.
- No logos, no watermarks, no branded UI marks.
- No readable text, words, letters, numbers, or labels anywhere.
- No floating arrows/icons/callouts.
- Subject scale target: ${subjectScaleTargetPct}% (range ${subjectScaleRangePct[0]}-${subjectScaleRangePct[1]}%).
- Negative space target: ${negativeSpaceTargetPct}% (range ${negativeSpaceRangePct[0]}-${negativeSpaceRangePct[1]}%).
- Hard negatives: ${styleTemplateHardNegatives.join(', ') || 'none'}.
- Professional editorial mood, but intentionally unfinished.
- Match this reference fingerprint:
${imageStyleSpecText || '- reference-style-spec.md not found; fallback to generic sketch style.'}
`.trim();

const defaultImagePrompt =
  'A single focal technical artifact composition (logs, config notes, and workflow marks) in rough editorial pen sketch style.';

const buildFinalImagePrompt = ({
  title,
  topic,
  coreAngle,
  concept,
  palette,
  sceneBrief,
}) =>
  [
    'Create a 16:9 editorial hero illustration for a technical research article.',
    'Style lock: rough notebook black-pencil sketch, visibly hand-drawn and unfinished, with broken jittery strokes.',
    'Important: do NOT clean up lines. Keep sketch construction marks and small perspective imperfections.',
    'Line color lock: single black graphite/pencil line family only (no multicolor inking).',
    `Style DNA linework lock: ${styleDnaLinework.join('; ') || 'scratchy rough pen lines'}.`,
    `Style DNA hatching lock: ${styleDnaHatching.join('; ') || 'local low-density hatching only'}.`,
    `Style DNA tonal lock: ${styleDnaTone.join('; ') || 'pure white paper background, no gradient, monochrome only'}.`,
    'Background lock: plain white paper (or near-white). No gradients and no color washes.',
    `Monochrome lock: only black pencil/graphite marks. Palette reference is fixed to ${palette.name}.`,
    `Topic focus (semantic only, never render as text): ${topic || 'agentic coding workflows'}.`,
    `Article title context (semantic only, never render as words): ${title}.`,
    coreAngle
      ? `Core angle (semantic only, no literal text rendering): ${coreAngle}.`
      : '',
    sceneBrief?.context_type
      ? `Scene brief context type: ${sceneBrief.context_type}.`
      : '',
    sceneBrief?.headline ? `Scene brief headline: ${sceneBrief.headline}.` : '',
    sceneBrief?.article_grounding
      ? `Scene grounding: ${sceneBrief.article_grounding}.`
      : '',
    sceneBrief?.context_type === 'artifact_focus'
      ? 'Human lock for artifact_focus: no visible person; center composition on technical artifacts.'
      : '',
    sceneBrief?.context_type === 'workflow_moment'
      ? 'Human lock for workflow_moment: no dominant person portrait; depict workflow transition through artifacts and state marks.'
      : '',
    `Scene concept to depict: ${concept || defaultImagePrompt}.`,
    'Composition lock: one clear focal subject or object; human optional.',
    'Anti-trope lock: avoid defaulting to a person behind a computer.',
    'Abstraction lock: make the scene conceptual and artsy, using symbolic forms and high-level visual metaphors.',
    'Hard device ban: no computers, monitors, laptops, screens, phones, tablets, browser windows, terminal windows, dashboards, or literal UI panels.',
    `Subject scale lock: keep the focal subject modest (${subjectScaleRangePct[0]}-${subjectScaleRangePct[1]}% canvas), target about ${subjectScaleTargetPct}%.`,
    `Negative-space lock: keep ${negativeSpaceRangePct[0]}-${negativeSpaceRangePct[1]}% empty paper/desk/background, target about ${negativeSpaceTargetPct}%.`,
    'Include only minimal supporting props that reinforce the article scene.',
    'No additional characters, no split panels, no storyboard, no collage, no literal network diagrams.',
    'No floating arrows, icons, labels, callouts, or decorative symbols.',
    'Hard text ban: no readable text, words, letters, numbers, titles, or labels anywhere in the image.',
    'No logos, no watermarks, no branding, no polished UI labels.',
    'Render with physical/symbolic shape language only; no digital interface motifs.',
    'Do not draw polished box-arrow flowcharts or literal UI modules.',
    'Stroke-density lock: keep hatching sparse and selective only. Do NOT fill hoodie/chair/body with dense crosshatching.',
    'Preserve large white-paper areas and lightness; keep overall line density low-to-medium.',
    'Line-weight lock: thin scratchy strokes, avoid thick dark contour blocks.',
    'If a reference image is provided as edit input, preserve style DNA closely but do not force identical framing every time.',
    'The style must look hand-sketched first, not polished illustration.',
    'Negative style constraints: not photorealistic, not 3D render, not glossy ad, not comic/cartoon style, not fantasy art, and absolutely no color accents.',
    styleTemplateHardNegatives.length
      ? `Template hard negatives to enforce: ${styleTemplateHardNegatives.join(', ')}.`
      : '',
    'Keep the scene minimal, with generous negative space and a clear silhouette.',
    'At thumbnail size, first impression must be: rough notebook-style technical editorial sketch.',
    `Quality gate targets: style >= ${imageMinScore}, composition >= ${imageCompositionMinScore}.`,
    imageStyleSpecText
      ? `Reference fingerprint to follow exactly:\n${imageStyleSpecText}`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

const referenceEditDirective = `
Reference edit lock:
- Treat the provided reference image as STYLE DNA only (line quality, tonal mood, roughness).
- You may redesign composition and subject to match the requested scene brief.
- Preserve rough hand-sketch identity, stroke behavior, and overall editorial mood.
- Avoid cloning the exact same person-at-desk framing from the reference.
`.trim();

const styleReferenceImageDataUri = styleReferenceImageBuffer
  ? imageBufferToDataUri(styleReferenceImageBuffer)
  : null;

const evaluateImageStyle = async ({
  imageBuffer,
  palette,
  concept,
  attempt,
  sceneBrief,
}) => {
  const systemPrompt =
    'You are a strict art-direction QA reviewer. Score against constraints and return JSON only.';
  const userText = `
Evaluate the FIRST image (candidate output) against the target style and hard constraints.
If a SECOND image is provided, it is the style reference to match.

Context:
- monochrome policy: black pencil/graphite marks only on white paper (no color accents)
- concept: ${concept}
- attempt: ${attempt}
- scene context type: ${sceneBrief?.context_type || 'unknown'}
${imageStyleSpecText ? `\nReference style fingerprint:\n${imageStyleSpecText}\n` : ''}

Calibration notes:
- Use full score range: 100 means near-identical style match, 90 means very close, 80 means moderately close.

Hard constraints (must pass):
1) one clear focal subject or object (human optional)
2) avoid repetitive person-behind-computer composition
3) rough hand-drawn pen/pencil linework with visible jitter and imperfections (not polished vector look)
4) plain white (or near-white) paper background, with no gradient and no color wash
5) no logos, watermarks, branding marks, or decorative overlays anywhere
6) composition follows scene brief while keeping editorial sketch readability
7) no floating arrows/icons/symbols/callouts
8) no readable text, words, letters, numbers, labels, or title banners anywhere in the image
9) linework should feel unfinished/human, not clean and polished
10) if reference image is provided, candidate should be close in stroke character and tonal mood (style DNA), without copying the same composition
11) keep hatching density low-to-medium, with visible white-paper breathing room (avoid dense fill shading)
12) subject scale should stay near target (${subjectScaleTargetPct}% with acceptable range ${subjectScaleRangePct[0]}-${subjectScaleRangePct[1]}%)
13) negative space should stay near target (${negativeSpaceTargetPct}% with acceptable range ${negativeSpaceRangePct[0]}-${negativeSpaceRangePct[1]}%)
14) if scene context type is artifact_focus, visible human figures are a hard fail
15) if scene context type is workflow_moment, dominant person portrait framing is a hard fail
16) composition should feel abstract/conceptual rather than a literal screenshot recreation
17) any visible computer/monitor/screen/laptop/browser/terminal/dashboard is a hard fail
18) any visible non-black color fill/accent/ink is a hard fail

Return JSON:
{
  "styleScore": 0-100,
  "compositionScore": 0-100,
  "pass": true|false,
  "hardFails": ["..."],
  "issues": ["..."],
  "retryPromptAddendum": "single concise instruction block to improve next attempt"
}

Pass criteria:
- styleScore >= ${imageMinScore}
- compositionScore >= ${imageCompositionMinScore}
- no hard fails
`.trim();

  const imageDataUris = [imageBufferToDataUri(imageBuffer)];
  if (styleReferenceImageDataUri) {
    imageDataUris.push(styleReferenceImageDataUri);
  }

  const review = await chatJsonWithImages({
    model: imageReviewModel,
    systemPrompt,
    userText,
    imageDataUris,
    temperature: 0.1,
  });

  const styleScore = Number.parseInt(String(review.styleScore ?? 0), 10) || 0;
  const compositionScore =
    Number.parseInt(String(review.compositionScore ?? 0), 10) || 0;
  const hardFails = Array.isArray(review.hardFails)
    ? review.hardFails.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const issues = Array.isArray(review.issues)
    ? review.issues.map(item => String(item || '').trim()).filter(Boolean)
    : [];
  const retryPromptAddendum = String(review.retryPromptAddendum || '').trim();
  const passesByScore =
    styleScore >= imageMinScore && compositionScore >= imageCompositionMinScore;
  const pass = hardFails.length === 0 && passesByScore;

  return {
    styleScore,
    compositionScore,
    pass,
    hardFails,
    issues,
    retryPromptAddendum,
  };
};

const extractSceneBriefsFromArticle = async ({
  title,
  description,
  body,
  topic,
}) => {
  if (dryRun) {
    return [
      {
        id: 'scene-workspace',
        context_type: 'workspace',
        headline: 'Workspace Snapshot',
        scene:
          'An abstract tabletop composition with blank index cards, thread-like connectors, and geometric tokens, with airy negative space and no digital devices.',
        article_grounding: 'Represents the article implementation environment.',
      },
      {
        id: 'scene-artifact',
        context_type: 'artifact_focus',
        headline: 'Artifact Focus',
        scene:
          'A non-human artifact tableau of symbolic modules, cables, and stacked physical fragments arranged as one focal composition; no screens or labels.',
        article_grounding:
          'Represents concrete technical artifacts discussed in the article.',
      },
      {
        id: 'scene-workflow',
        context_type: 'workflow_moment',
        headline: 'Workflow Moment',
        scene:
          'A workflow transition moment depicted with abstract state shapes, rhythm marks, and relay-like physical tokens, minimal and conceptual; no digital devices.',
        article_grounding:
          'Represents a workflow decision moment from the article.',
      },
    ];
  }

  const response = await chatJson([
    {
      role: 'system',
      content:
        'You extract concise, concrete visual scene briefs from technical writing for editorial hero images.',
    },
    {
      role: 'user',
      content: `Extract 3 scene briefs grounded in this finalized article.

Rules:
- Keep each scene specific and traceable to the article body.
- Use DISTINCT context_type values: workspace, artifact_focus, workflow_moment.
- Do NOT default all scenes to a person behind a computer.
- At least one scene must be non-human (no visible person).
- At least one scene should center on artifacts or workflow states, not a desk portrait.
- For artifact_focus, explicitly avoid visible humans.
- For workflow_moment, avoid dominant human portrait framing.
- Prefer abstract, high-level conceptual scenes over literal UI depictions.
- No text in scene concepts: avoid words, labels, letters, numbers, or title banners inside visuals.
- Hard device ban in scene concepts: no computers, monitors, laptops, screens, phones, tablets, browser windows, terminal windows, or dashboards.
- Keep each scene concise and drawable.

Title: ${title}
Description: ${description}
Topic: ${topic || 'agentic coding'}

Article body:
${body}

Return JSON:
{
  "sceneBriefs": [
    {
      "id": "scene-1",
      "context_type": "workspace|artifact_focus|workflow_moment",
      "headline": "short title",
      "scene": "single concise scene description",
      "article_grounding": "what this reflects in article"
    }
  ]
}`,
    },
  ]);

  const raw = Array.isArray(response.sceneBriefs) ? response.sceneBriefs : [];
  const allowedTypes = new Set(SCENE_CONTEXT_TYPES);
  const normalized = raw
    .map((item, index) => {
      const contextType = String(item?.context_type || '').trim();
      return {
        id: String(item?.id || `scene-${index + 1}`).trim(),
        context_type: allowedTypes.has(contextType)
          ? contextType
          : SCENE_CONTEXT_TYPES[index % SCENE_CONTEXT_TYPES.length],
        headline: String(item?.headline || `Scene ${index + 1}`).trim(),
        scene: String(item?.scene || '').trim(),
        article_grounding: String(item?.article_grounding || '').trim(),
      };
    })
    .filter(item => item.scene);

  const fallback = [
    {
      id: 'scene-workspace',
      context_type: 'workspace',
      headline: 'Workspace Snapshot',
      scene:
        'An abstract tabletop composition with blank index cards, thread-like connectors, and geometric tokens, with airy negative space and no digital devices.',
      article_grounding: 'Represents the article implementation environment.',
    },
    {
      id: 'scene-artifact',
      context_type: 'artifact_focus',
      headline: 'Artifact Focus',
      scene:
        'A non-human artifact tableau of symbolic modules, cables, and stacked physical fragments arranged as one focal composition; no screens or labels.',
      article_grounding:
        'Represents concrete technical artifacts discussed in the article.',
    },
    {
      id: 'scene-workflow',
      context_type: 'workflow_moment',
      headline: 'Workflow Moment',
      scene:
        'A workflow transition moment depicted with abstract state shapes, rhythm marks, and relay-like physical tokens, minimal and conceptual; no digital devices.',
      article_grounding:
        'Represents a workflow decision moment from the article.',
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
    const fallbackItem = fallback.find(scene => scene.context_type === type);
    return preferred || fallbackItem;
  }).filter(Boolean);

  const constrained = anchoredByType.map(item => {
    const scene = String(item.scene || '');
    const humanHeavy = /\b(developer|engineer|person|human|worker)\b/i.test(
      scene
    );
    const textHeavy =
      /\b(text|label|labels|title|banner|words|letters|numbers|readable|caption)\b/i.test(
        scene
      );
    const deviceHeavy =
      /\b(computer|monitor|screen|laptop|desktop|browser|terminal|dashboard|window|ui|display|tablet|phone)\b/i.test(
        scene
      );
    if (item.context_type === 'artifact_focus' && humanHeavy) {
      return fallback.find(s => s.context_type === 'artifact_focus') || item;
    }
    if (item.context_type === 'workflow_moment' && humanHeavy) {
      return fallback.find(s => s.context_type === 'workflow_moment') || item;
    }
    if (textHeavy) {
      return fallback.find(s => s.context_type === item.context_type) || item;
    }
    if (deviceHeavy) {
      return fallback.find(s => s.context_type === item.context_type) || item;
    }
    return item;
  });

  const hasNonHuman = constrained.some(
    item =>
      !/\b(developer|engineer|person|human|worker)\b/i.test(
        String(item.scene || '')
      )
  );
  if (!hasNonHuman) {
    constrained[0] =
      fallback.find(s => s.context_type === 'artifact_focus') || constrained[0];
  }

  return constrained.slice(0, 3);
};

const draftSystem =
  'You are a technical editor for claudeworkshop.com/research. Be practical, concrete, and evidence-led. Avoid hype and generic claims.';
const humanizerSystem =
  'You are applying a humanizer pass to technical writing. Keep facts intact, remove AI-sounding phrasing, use direct language, and keep a natural human cadence. Remove inflated significance claims, vague attribution, rule-of-three filler, em-dash overuse, and buzzword-heavy AI vocabulary.';

let finalDraft = null;
let finalBody = '';
let lastErrors = [];
let feedback = '';

for (let attempt = 1; attempt <= maxDraftAttempts; attempt += 1) {
  const draftUser = `
Create a long-form research article package from this source signal:
${JSON.stringify(candidate, null, 2)}

Rules:
- Audience: agentic coders and engineering teams.
- Use only # and ## headings.
- Keep section headings unnumbered (no "## 1. ..." patterns).
- Include practical implementation steps.
- Include tradeoffs and limitations.
- Do not invent facts. If uncertain, state uncertainty.
- No fluff. No promotional tone.
- Prefer paragraph-first writing. Use a short bullet list only when it clearly improves scanability.
- Use a markdown table only if it materially improves a comparison; otherwise skip tables.
- Length target: around ${targetWordCount} words, and must stay between ${minWordCount}-${maxWordCount} words.
- For imagePrompt, return only the SCENE CONCEPT (what should be depicted), not styling instructions.
- The system will apply styling automatically.
- Scene concept should follow this style guide:
${imageStyleGuide}
${feedback ? `\nFix these quality issues from previous attempt:\n${feedback}` : ''}

Return JSON with schema:
${JSON.stringify(articleDraftSchema, null, 2)}
`;

  const draft = dryRun
    ? {
        title:
          candidate.article_working_title ||
          'What this signal means for agentic coding teams',
        description:
          'A practical analysis of one high-signal X bookmark and what engineering teams should do next.',
        category: 'ai-coding',
        tags: ['agentic coding', 'engineering teams', 'workflow design'],
        metaTitle: 'Dry run research draft',
        metaDescription: 'Dry run output generated by Nautilus.',
        articleMarkdown: `# ${candidate.article_working_title || 'Dry run draft'}\n\n## Why this matters\n\nThis is a dry run artifact.\n\n## What to test next\n\n- Validate pipeline wiring.\n- Validate content export.\n- Validate distribution handoff.`,
        imagePrompt:
          'A developer reviewing autonomous coding tasks on a workstation while lightweight process diagrams float around the desk.',
      }
    : await chatJson([
        { role: 'system', content: draftSystem },
        { role: 'user', content: draftUser },
      ]);

  const humanized = dryRun
    ? { articleMarkdown: draft.articleMarkdown }
    : await chatJson([
        { role: 'system', content: humanizerSystem },
        {
          role: 'user',
          content: `Humanize this article body while preserving facts.

Hard constraints:
- Keep claims concrete and specific; do not add new facts.
- Replace vague attributions ("experts say", "industry reports") with direct phrasing unless explicitly sourced in text.
- Remove inflated framing ("pivotal moment", "evolving landscape", "testament to").
- Remove marketing tone and AI-buzzword stuffing.
- Avoid formulaic "not just X, but Y" and forced rule-of-three patterns.
- Keep sentence rhythm varied and natural.
- Keep the tone practical for engineers.
- Keep section headings unnumbered (no "## 1. ..." patterns).
- Keep paragraph flow primary; keep lists short and occasional.

Respect this additional guidance: ${candidate.humanizer_notes || 'Keep direct and specific wording.'}

Return JSON with only key articleMarkdown.

Article:
${draft.articleMarkdown}`,
        },
      ]);

  const title = String(
    draft.title || candidate.article_working_title || 'Research Update'
  ).trim();
  const description = String(draft.description || '').trim();

  let body = sanitizeBody(
    humanized.articleMarkdown || draft.articleMarkdown,
    title
  );
  if (countWords(body) > maxWordCount) {
    body = trimMarkdownToWordLimit(body, maxWordCount);
  }
  const errors = validateDraft({ body, title, description });

  if (errors.length === 0) {
    finalDraft = {
      ...draft,
      title,
      description,
    };
    finalBody = body;
    lastErrors = [];
    break;
  }

  lastErrors = errors;
  feedback = errors.map(err => `- ${err}`).join('\n');
  console.warn(
    `Quality gate failed on attempt ${attempt}/${maxDraftAttempts}:\n${feedback}`
  );
}

if (!finalDraft) {
  throw new Error(
    `Quality gate failed after ${maxDraftAttempts} attempts:\n${lastErrors.join('\n')}`
  );
}

const slug = ensureUniqueSlug(baseSlug, outboxDir);
const articleUrl = `${articleBaseUrl}/${slug}`;
const articleImagePath = `/images/editorials/${slug}.png`;

const title = finalDraft.title;
const description = finalDraft.description;
const category = normalizeCategory(finalDraft.category);
const tags = normalizeTags(finalDraft.tags);
const metaTitle = String(finalDraft.metaTitle || title).trim();
const metaDescription = String(
  finalDraft.metaDescription || description
).trim();
const publishedAt = new Date().toISOString().slice(0, 10);
const sceneBriefs = await extractSceneBriefsFromArticle({
  title,
  description,
  body: finalBody,
  topic: candidate.topic,
});
const sceneTypeStart =
  hashString(`${candidate.id}-${slug}-${publishedAt}`) %
  SCENE_CONTEXT_CYCLE.length;
const preferredSceneTypes = SCENE_CONTEXT_CYCLE.map(
  (_, offset) =>
    SCENE_CONTEXT_CYCLE[(sceneTypeStart + offset) % SCENE_CONTEXT_CYCLE.length]
);
const selectedSceneBrief =
  preferredSceneTypes
    .map(type => sceneBriefs.find(item => item?.context_type === type))
    .find(Boolean) ||
  sceneBriefs[0] ||
  null;

const frontmatter = [
  '---',
  `title: '${escapeSingleQuotedYaml(title)}'`,
  `description: '${escapeSingleQuotedYaml(description)}'`,
  `image: '${escapeSingleQuotedYaml(articleImagePath)}'`,
  `author: '${escapeSingleQuotedYaml(authorName)}'`,
  `authorUrl: '${escapeSingleQuotedYaml(authorUrl)}'`,
  `publishedAt: '${publishedAt}'`,
  `category: '${escapeSingleQuotedYaml(category)}'`,
  'tags:',
  ...tags.map(tag => `  - '${escapeSingleQuotedYaml(tag)}'`),
  'featured: false',
  `metaTitle: '${escapeSingleQuotedYaml(metaTitle)}'`,
  `metaDescription: '${escapeSingleQuotedYaml(metaDescription)}'`,
  '---',
  '',
].join('\n');

const articleMdx = `${frontmatter}${finalBody.trim()}\n`;

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.join(outboxDir, `${stamp}-${slug}`);
fs.mkdirSync(runDir, { recursive: true });
const imageAttemptsDir = path.join(runDir, 'image-attempts');
fs.mkdirSync(imageAttemptsDir, { recursive: true });
writeText(
  path.join(runDir, 'scene-briefs.json'),
  `${JSON.stringify(sceneBriefs, null, 2)}\n`
);

let imageGenerated = false;
let imageError = null;
let imageStylePass = null;
let imageStyleScore = null;
let imageCompositionScore = null;
let imageStyleAttempts = 0;
let imageStyleFallbackUsed = false;
const imageReviewHistory = [];
const imageConcept = String(
  selectedSceneBrief?.scene ||
    finalDraft.imagePrompt ||
    candidate.image_prompt_draft ||
    defaultImagePrompt
).trim();
const gradientPalette = pickGradientPalette(
  `${candidate.id}-${slug}-${publishedAt}`
);
const imagePrompt = buildFinalImagePrompt({
  title,
  topic: candidate.topic,
  coreAngle: candidate.core_angle,
  concept: imageConcept,
  palette: gradientPalette,
  sceneBrief: selectedSceneBrief,
});

if (!dryRun && imagePrompt) {
  try {
    let selectedImageBuffer = null;
    let selectedImageAttempt = null;
    let retryAddendum = '';
    let bestImageBuffer = null;
    let bestImageScore = -1;
    let bestImageAttempt = null;

    for (let attempt = 1; attempt <= imageMaxAttempts; attempt += 1) {
      imageStyleAttempts = attempt;
      const attemptLabel = String(attempt).padStart(2, '0');
      const promptForAttempt = [
        imagePrompt,
        preferReferenceEdit && styleReferenceImageBuffer
          ? referenceEditDirective
          : '',
        retryAddendum
          ? `Revision notes from failed style QA: ${retryAddendum}`
          : '',
        `Attempt ${attempt}/${imageMaxAttempts}. Respect all hard constraints.`,
      ]
        .filter(Boolean)
        .join('\n\n');

      let imageBuffer = null;
      if (preferReferenceEdit && styleReferenceImageBuffer) {
        try {
          imageBuffer = await generateImageFromReference({
            prompt: promptForAttempt,
            referenceBuffer: styleReferenceImageBuffer,
          });
        } catch (editError) {
          const reason =
            editError instanceof Error ? editError.message : String(editError);
          console.warn(
            `Image edit fallback to generations on attempt ${attempt}: ${reason}`
          );
          imageBuffer = await generateImage(promptForAttempt);
        }
      } else {
        imageBuffer = await generateImage(promptForAttempt);
      }
      fs.writeFileSync(
        path.join(imageAttemptsDir, `attempt-${attemptLabel}.png`),
        imageBuffer
      );
      let styleReview = null;
      try {
        usageMetrics.image_review_calls += 1;
        styleReview = await evaluateImageStyle({
          imageBuffer,
          palette: gradientPalette,
          concept: imageConcept,
          attempt,
          sceneBrief: selectedSceneBrief,
        });
      } catch (reviewError) {
        styleReview = {
          styleScore: 0,
          compositionScore: 0,
          pass: false,
          hardFails: ['Style review failed'],
          issues: [
            reviewError instanceof Error
              ? reviewError.message
              : String(reviewError),
          ],
          retryPromptAddendum:
            'Make the drawing rougher and more human-like in stroke quality, keep one clear focal subject or object, avoid person-behind-computer defaults, keep it conceptual/abstract, remove floating arrows/icons, remove all readable text/labels, and remove all computer/screen/device motifs.',
        };
      }

      if (styleReview.styleScore > bestImageScore) {
        bestImageScore = styleReview.styleScore;
        bestImageBuffer = imageBuffer;
        bestImageAttempt = attempt;
      }

      imageReviewHistory.push({
        attempt,
        styleScore: styleReview.styleScore,
        compositionScore: styleReview.compositionScore,
        pass: styleReview.pass,
        hardFails: styleReview.hardFails,
        issues: styleReview.issues,
        retryPromptAddendum: styleReview.retryPromptAddendum,
      });
      writeText(
        path.join(imageAttemptsDir, `attempt-${attemptLabel}.review.json`),
        `${JSON.stringify(
          {
            attempt,
            styleScore: styleReview.styleScore,
            compositionScore: styleReview.compositionScore,
            pass: styleReview.pass,
            hardFails: styleReview.hardFails,
            issues: styleReview.issues,
            retryPromptAddendum: styleReview.retryPromptAddendum,
            promptForAttempt,
          },
          null,
          2
        )}\n`
      );

      console.log(
        `Image style QA attempt ${attempt}/${imageMaxAttempts}: style=${styleReview.styleScore}, composition=${styleReview.compositionScore}, pass=${styleReview.pass}`
      );

      if (styleReview.pass) {
        selectedImageBuffer = imageBuffer;
        selectedImageAttempt = attempt;
        imageStylePass = true;
        imageStyleScore = styleReview.styleScore;
        imageCompositionScore = styleReview.compositionScore;
        usageMetrics.image_review_passes += 1;
        break;
      }

      retryAddendum =
        styleReview.retryPromptAddendum ||
        [
          ...styleReview.hardFails,
          ...styleReview.issues,
          'Keep one clear focal subject/object, preserve rough unfinished linework, keep the scene abstract/conceptual, avoid repetitive person-at-computer tropes, remove floating arrows/icons, remove all readable text/labels, and remove all computer/screen/device motifs.',
        ]
          .filter(Boolean)
          .join(' ');
      imageStylePass = false;
      imageStyleScore = styleReview.styleScore;
      imageCompositionScore = styleReview.compositionScore;
    }

    if (!selectedImageBuffer) {
      if (bestImageBuffer) {
        fs.writeFileSync(path.join(runDir, 'image-best.png'), bestImageBuffer);
        writeText(
          path.join(runDir, 'image-best.json'),
          `${JSON.stringify(
            {
              bestImageScore,
              bestImageAttempt,
            },
            null,
            2
          )}\n`
        );
        selectedImageBuffer = bestImageBuffer;
        imageStyleFallbackUsed = true;
        writeText(
          path.join(runDir, 'image-best-fallback.json'),
          `${JSON.stringify(
            {
              reason:
                'Style QA did not pass configured threshold; using best generated attempt instead of reference image.',
              configuredMinScore: imageMinScore,
              configuredCompositionMinScore: imageCompositionMinScore,
              bestScore: bestImageScore,
              bestAttempt: bestImageAttempt,
            },
            null,
            2
          )}\n`
        );
        console.warn(
          `Image style QA did not pass. Using best generated attempt from this run (attempt ${bestImageAttempt}, score ${bestImageScore}).`
        );
      } else {
        throw new Error(
          `Image style QA failed after ${imageMaxAttempts} attempts. Last scores: style=${imageStyleScore}, composition=${imageCompositionScore}. Best style score: ${bestImageScore} (attempt ${bestImageAttempt}).`
        );
      }
    }

    fs.writeFileSync(path.join(runDir, 'image.png'), selectedImageBuffer);
    if (selectedImageAttempt != null) {
      writeText(
        path.join(runDir, 'image-selected.json'),
        `${JSON.stringify(
          {
            selectedImageAttempt,
            selectedImageScore: imageStyleScore,
            selectedImageCompositionScore: imageCompositionScore,
          },
          null,
          2
        )}\n`
      );
    }
    imageGenerated = true;
  } catch (error) {
    imageError = error instanceof Error ? error.message : String(error);
    throw new Error(`Image generation failed: ${imageError}`);
  }
}

if (!dryRun && !imageGenerated) {
  throw new Error(
    'Custom hero image generation is required before packaging the research article.'
  );
}

writeText(path.join(runDir, 'article.mdx'), articleMdx);

const snippetSchema = {
  linkedinSnippet: 'string',
};

const linkedinSnippet = dryRun
  ? `Signal worth watching for agentic coding teams. Full write-up: ${articleUrl}`
  : String(
      (
        await chatJson([
          {
            role: 'system',
            content:
              'You write concise LinkedIn snippets that tease a technical article without sounding salesy.',
          },
          {
            role: 'user',
            content: `Write one LinkedIn snippet based on this finalized published article. Include this URL exactly once: ${articleUrl}\n\nArticle:\n${finalBody}\n\nReturn JSON with schema: ${JSON.stringify(
              snippetSchema
            )}`,
          },
        ])
      ).linkedinSnippet || ''
    ).trim();

const snippetWithUrl = linkedinSnippet.includes(articleUrl)
  ? linkedinSnippet
  : `${linkedinSnippet}\n\n${articleUrl}`.trim();

writeText(path.join(runDir, 'linkedin.txt'), `${snippetWithUrl}\n`);

const packageManifest = {
  usage: {
    ...usageMetrics,
    estimated_text_cost_usd:
      (usageMetrics.chat_prompt_tokens / 1_000_000) * textInputUsdPer1M +
      (usageMetrics.chat_completion_tokens / 1_000_000) * textOutputUsdPer1M,
    estimated_image_cost_usd: imageGenerated ? image1536x1024UsdEach : 0,
    estimated_total_cost_usd:
      (usageMetrics.chat_prompt_tokens / 1_000_000) * textInputUsdPer1M +
      (usageMetrics.chat_completion_tokens / 1_000_000) * textOutputUsdPer1M +
      (imageGenerated ? image1536x1024UsdEach : 0),
    pricing_assumptions: {
      text_input_usd_per_1m: textInputUsdPer1M,
      text_output_usd_per_1m: textOutputUsdPer1M,
      image_1536x1024_usd_each: image1536x1024UsdEach,
    },
  },
  generated_at: new Date().toISOString(),
  dry_run: dryRun,
  slug,
  article_url: articleUrl,
  image_file: imageGenerated ? 'image.png' : null,
  image_generation_error: imageError,
  candidate,
  package: {
    title,
    description,
    category,
    tags,
    metaTitle,
    metaDescription,
    linkedinSnippet: snippetWithUrl,
    imagePalette: gradientPalette,
    imageStyleReferenceUsed: Boolean(styleReferenceImageDataUri),
    imageStyleReferencePath: styleReferenceImageDataUri
      ? path.relative(PROJECT_ROOT, imageReferencePath)
      : null,
    imageStyleTemplatePath: fs.existsSync(styleTemplatePath)
      ? path.relative(PROJECT_ROOT, styleTemplatePath)
      : null,
    imageStyleMinScore: imageMinScore,
    imageCompositionMinScore,
    imageStylePass,
    imageStyleScore,
    imageCompositionScore,
    imageStyleAttempts,
    imageStyleFallbackUsed,
    imageStyleReview: imageReviewHistory,
    imageSceneBriefs: sceneBriefs,
    selectedImageSceneBrief: selectedSceneBrief,
    imagePrompt,
    wordCount: countWords(finalBody),
  },
};

writeText(
  path.join(runDir, 'package.json'),
  `${JSON.stringify(packageManifest, null, 2)}\n`
);

const latestState = {
  updated_at: new Date().toISOString(),
  slug,
  article_url: articleUrl,
  outbox_dir: path.relative(PROJECT_ROOT, runDir),
  candidate_id: candidate.id,
  dry_run: dryRun,
};

writeText(
  path.join(stateDir, 'latest-publish.json'),
  `${JSON.stringify(latestState, null, 2)}\n`
);

console.log(`Packaged slug: ${slug}`);
console.log(`Article URL: ${articleUrl}`);
console.log(`Outbox: ${runDir}`);
console.log(
  `Usage: chat_calls=${usageMetrics.chat_calls}, prompt_tokens=${usageMetrics.chat_prompt_tokens}, completion_tokens=${usageMetrics.chat_completion_tokens}, image_calls=${usageMetrics.image_calls}, image_review_calls=${usageMetrics.image_review_calls}, image_review_passes=${usageMetrics.image_review_passes}`
);
console.log(
  `Estimated API cost (generation only): $${(
    (usageMetrics.chat_prompt_tokens / 1_000_000) * textInputUsdPer1M +
    (usageMetrics.chat_completion_tokens / 1_000_000) * textOutputUsdPer1M +
    (imageGenerated ? image1536x1024UsdEach : 0)
  ).toFixed(4)}`
);
if (imageError) {
  console.log(`Image warning: ${imageError}`);
}
