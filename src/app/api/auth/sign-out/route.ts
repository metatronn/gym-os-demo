import { jsonSignedOut, validateJsonMutation } from "@/lib/auth-api";

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  return jsonSignedOut();
}
