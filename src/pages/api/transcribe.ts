import type { APIRoute } from 'astro';
import { Client, handle_file } from '@gradio/client';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!import.meta.env.PUBLIC_HUGGINGFACE_TOKEN) {
      return new Response(JSON.stringify({ error: 'Hugging Face token not found' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const model = formData.get('model') as string || 'standard'; // Get the model, default to 'standard'

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });

    const spaceName = model === 'turbo' ? "hf-audio/whisper-large-v3-turbo" : "hf-audio/whisper-large-v3"; // Choose the space
    const app = await Client.connect(spaceName, {
      hf_token: import.meta.env.PUBLIC_HUGGINGFACE_TOKEN,
    });

    const result = await app.predict('/predict', [handle_file(audioBlob), 'transcribe']);

    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const transcription = result.data[0];
      if (typeof transcription === 'string') {
        return new Response(JSON.stringify({ transcription }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({ error: 'transcription is not a string' }), { status: 500 });
      }
    } else {
      return new Response(JSON.stringify({ error: 'result is invalid' }), { status: 500 });
    }
  } catch (error) {
     // ... (same error handling)
     let errorMessage = 'Transcription failed';
    let errorDetails = 'Unknown error';

    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'string') {
      errorDetails = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
        // Check if the object has a 'message' property before accessing it
        const errObj = error as { message?: unknown }; // Type assertion
        if (typeof errObj.message === 'string') {
            errorDetails = errObj.message;
        }

    }


    return new Response(JSON.stringify({ error: errorMessage, details: errorDetails }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};