import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseconfig";

export async function GET(request, { params }) {
  try {
    const { interviewId } = params;
    if (!interviewId) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const questionsRef = db.collection("interviews").doc(interviewId).collection("questions");
    const snapshot = await questionsRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "No questions found" }, { status: 404 });
    }

    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(questions);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
