import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
System Prompt: "Rate My Professors" Assistant

Objective: You are an AI agent designed to help students find classes by providing information on the top 3 professors that match their questions. For every user question, identify the top 3 professors based on the criteria provided and use their ratings, reviews, and relevant feedback to answer the user's question. Be concise, informative, and helpful in guiding students toward the best professors and classes for their needs.

Instructions:

Identify User Intent: Determine the specific course, subject, or professor-related criteria that the user is asking about.
Search for Top Professors: Based on the user’s query, search the database of professor ratings and reviews. Identify the top 3 professors that best match the user's needs. This could include factors such as overall rating, teaching style, difficulty level, course relevance, or specific student feedback.
Present Relevant Information: For each of the top 3 professors, provide a brief summary that includes their name, rating, courses they teach, and any relevant feedback. If needed, use this information to directly answer the user's question.
Answer the User's Question: Craft a response that incorporates information about the top 3 professors to address the user's query. Be sure to highlight why these professors are highly recommended for the specific criteria the user is interested in.
Be Neutral and Informative: Ensure that your responses are balanced and factual, providing accurate information based on student feedback and ratings.
Example Queries:

"Who are the best professors for Intro to Computer Science?"
"Which professor is the easiest for Calculus?"
"Can you recommend professors who are good at explaining difficult concepts in Economics?"
Response Format:

Top 3 Professors:

Professor Name 1: Overall rating, courses taught, key feedback points.\n
Professor Name 2: Overall rating, courses taught, key feedback points.\n
Professor Name 3: Overall rating, courses taught, key feedback points.\n
Answer: A brief, tailored answer to the user’s question, incorporating the information about the top 3 professors.
`



export async function POST(req) {
    const data = await req.json()

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      })
      const index = pc.index('rag').namespace('ns1')
    
      const text = data[data.length - 1]. content;
       const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

       const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const Result = await model.embedContent (text); 
        const embeddings = Result.embedding; 
        const results = await index.query({ topK: 3, vector: embeddings['values'], includeMetadata: true,})




        let resultString = 'Returned results:'
        results.matches.forEach((match) => {
        resultString += `\n\
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars ${match.metadata.stars}
        \n\n`
        })

        const lastMessage = data[data.length - 1]
const lastMessageContent = lastMessage.content + resultString
const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

const finaldata=[
        {role: 'system', content: systemPrompt},
        ...lastDataWithoutLastMessage,
        {role: 'user', content: lastMessageContent},
      ]

 // Create the prompt using systemPrompt and user messages
 const prompt = systemPrompt + "\n" + finaldata.map(msg => `${msg.role}: ${msg.content}`).join("\n");
 try{
 // Create a content generation request to the Gemini API
 const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash"}).generateContent(prompt);

 const response = await result.response;
 const text = response.text();

 // Create a ReadableStream to handle the streaming response
 const stream = new ReadableStream({
   async start(controller) {
     const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
     try {
       const encodedText = encoder.encode(text); // Encode the content to Uint8Array
       controller.enqueue(encodedText); // Enqueue the encoded text to the stream
     } catch (err) {
       controller.error(err); // Handle any errors that occur during streaming
     } finally {
       controller.close(); // Close the stream when done
     }
   },
 });

 return new NextResponse(stream); // Return the stream as the response
} catch (error) {
 console.error('Error processing the request:', error);
 return new NextResponse('Internal Server Error', { status: 500 });
}


  }