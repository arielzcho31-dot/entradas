"use server";

import {
  suggestRelevantContent,
  type SuggestRelevantContentInput,
} from "@/ai/flows/suggest-relevant-content";

export async function getSuggestedContent(
  input: SuggestRelevantContentInput
) {
  try {
    const result = await suggestRelevantContent(input);
    return { success: true, data: result.suggestedContentUrls };
  } catch (error) {
    console.error("Error fetching suggested content:", error);
    return { success: false, error: "Failed to fetch suggestions." };
  }
}
