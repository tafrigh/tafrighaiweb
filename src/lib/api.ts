// src/lib/api.ts

// --- Type Definitions ---

export type SuccessResult = {
    success: true;
    transcription: string;
    html?: string; // Optional: only present for YouTube results
};

export type ErrorResult = {
    success: false;
    error: string; // A user-friendly error message
    details?: string; // Optional details from the server
};

export type TranscribeResult = SuccessResult | ErrorResult;

// --- API Functions ---

/**
 * Transcribes an audio file using the backend API.
 * @param file The audio file to transcribe.
 * @param model The model to use ('standard' or 'turbo').
 * @returns A promise resolving to a TranscribeResult object.
 */
export async function transcribeAudioFile(file: File, model: string): Promise<TranscribeResult> {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("model", model);

    try {
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.transcription) {
            return {
                success: true,
                transcription: data.transcription,
            };
        } else {
            // Handle specific API error or fallback
            const errorMessage = data.error || `Request failed with status ${response.status}`;
            const errorDetails = data.details;
            console.error("Audio transcription API error:", errorMessage, errorDetails ? `Details: ${errorDetails}` : '');
            return {
                success: false,
                error: errorMessage,
                details: errorDetails,
            };
        }
    } catch (error) {
        console.error("Error fetching audio transcription:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            error: `Network or fetch error: ${errorMessage}`,
        };
    }
}

/**
 * Transcribes audio from a YouTube URL using the backend API.
 * @param url The YouTube URL.
 * @param model The model to use ('standard' or 'turbo').
 * @returns A promise resolving to a TranscribeResult object.
 */
export async function transcribeYouTubeUrl(url: string, model: string): Promise<TranscribeResult> {
    const formData = new FormData();
    formData.append("yt_url", url);
    formData.append("model", model);

    try {
        const response = await fetch('/api/transcribe-yt', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.transcription) {
            // Expecting both html and transcription on success for YT
            return {
                success: true,
                transcription: data.transcription,
                html: data.html || "", // Include html, provide fallback if missing
            };
        } else {
            const errorMessage = data.error || `Request failed with status ${response.status}`;
            const errorDetails = data.details;
            console.error("YouTube transcription API error:", errorMessage, errorDetails ? `Details: ${errorDetails}` : '');
            return {
                success: false,
                error: errorMessage,
                details: errorDetails,
            };
        }
    } catch (error) {
        console.error("Error fetching YouTube transcription:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            error: `Network or fetch error: ${errorMessage}`,
        };
    }
}