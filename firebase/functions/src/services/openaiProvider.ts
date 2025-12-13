import { OpenAI } from 'openai';
import { AiProvider, AnalyzeMediaInput, AnalyzeMediaResult } from './aiProvider';

class OpenAiMetadataProvider implements AiProvider {
  public name = 'openai';

  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }

    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async analyzeMedia(input: AnalyzeMediaInput): Promise<AnalyzeMediaResult> {
    // NOTE: This starter does not download/stream the actual video.
    // In real apps, you would pre-process the media into: timestamps, keyframes, transcripts,
    // then send those artifacts to an AI model.

    const prompt = [
      'You are generating sports performance insights.',
      'Return a concise JSON object with: summary (string), tags (string[]), events (optional).',
      `media_asset_id=${input.mediaAssetId}`,
      `analysis_version=${input.analysisVersion}`
    ].join('\n');

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.choices?.[0]?.message?.content ?? '';

    // Best-effort parsing; keep raw output.
    return {
      summary: text.slice(0, 500) || 'Analysis completed.',
      tags: ['metadata'],
      raw: { text, responseId: response.id }
    };
  }
}

class VideoModelPlaceholderProvider implements AiProvider {
  public name = 'video_model';

  async analyzeMedia(input: AnalyzeMediaInput): Promise<AnalyzeMediaResult> {
    // TODO: Call your pose/technique API here.
    return {
      summary: `Placeholder analysis for ${input.mediaAssetId}. Integrate your video model API.`,
      tags: ['placeholder'],
      raw: { provider: 'video_model', input }
    };
  }
}

export function getAiProvider(requested?: string): AiProvider {
  if (requested === 'video_model') {
    return new VideoModelPlaceholderProvider();
  }

  // default
  return new OpenAiMetadataProvider();
}
