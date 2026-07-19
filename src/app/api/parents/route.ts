import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { normalizeParentOptions } from "@/lib/parents";
import type { Gender } from "@/lib/types";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender") as Gender;
    if (gender !== "m" && gender !== "f") {
      return NextResponse.json(
        { error: "gender must be `m` or `f`." },
        { status: 400 },
      );
    }

    const repository = getFamilyRepository();
    const parents = await repository.listParents(gender);

    return NextResponse.json(normalizeParentOptions(parents, gender));
  } catch (error) {
    return handleApiError({ route: "/api/parents", method: "GET" }, error);
  }
}
