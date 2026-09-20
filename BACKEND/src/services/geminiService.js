/**
 * Google Gemini AI Stage Script Synthesis Service
 */
export const synthesizeStageScript = async (payload, eventData) => {
  const {
    scriptType = 'Speaker Introduction',
    tone = 'Professional',
    length = 'Standard',
    audience = 'Tech Community & Delegates',
    customNotes = '',
    speakerName = '',
    speakerOrg = '',
    speakerDesig = '',
    speakerBio = '',
    speakerTopic = '',
    currentActivityTitle = '',
    nextActivityTitle = ''
  } = payload;

  const eventName = eventData?.name || 'TECHFEST 2026';
  const venue = eventData?.venue || 'Grand Convention Center';
  const geminiKey = process.env.GEMINI_API_KEY || '';

  const lengthGuide = {
    Short: 'Very concise, approx. 45-75 words. Punchy, focused, quick 30-45 seconds read with minimal stage cues.',
    Standard: 'Medium length, approx. 140-220 words. Well-structured opening, core message, and warm closing with 2-3 stage cues.',
    Detailed: 'Comprehensive and expansive, approx. 320-480 words. Rich storytelling, detailed stage cues [Stage Cue: ...], lighting/audio transitions, audience interaction, and grand introduction.'
  }[length] || 'Medium length, 150-200 words.';

  const transitionContext = currentActivityTitle && nextActivityTitle
    ? `\n- Transition Flow: Concluding "${currentActivityTitle}" and introducing next segment "${nextActivityTitle}"`
    : '';

  const prompt = `You are an elite live stage anchor and emcee for "${eventName}" taking place at "${venue}".

Generate an authentic, ready-to-speak live stage anchor script:
- Script Type: ${scriptType}
- Tone / Style: ${tone}
- Target Length: ${length} (${lengthGuide})
- Target Audience: ${audience}${transitionContext}
${speakerName ? `- Featured Speaker: ${speakerName}${speakerDesig ? ` (${speakerDesig}${speakerOrg ? `, ${speakerOrg}` : ''})` : (speakerOrg ? ` (${speakerOrg})` : '')}
${speakerBio ? `- Speaker Bio: ${speakerBio}\n` : ''}- Session Topic: ${speakerTopic || 'the next session'}` : (speakerTopic ? `- Topic / Focus: ${speakerTopic}` : '')}
${customNotes ? `- Special Talking Points / Custom Instructions: ${customNotes}` : ''}

CRITICAL FORMATTING INSTRUCTIONS:
1. Include realistic [Stage Cue: ...] brackets for physical actions, pacing, lighting/music cues, and audience interactions.
2. Bold key speaker names, topics, and punchlines using markdown **bold**.
3. Strictly respect the requested length (${length}).
4. Output ONLY the anchor script and stage cues. No meta commentary or conversational filler.`;

  // Try live Gemini API if key is valid
  if (geminiKey && geminiKey.length > 10 && geminiKey !== 'your_gemini_api_key_here') {
    const candidateModels = ['gemini-3.6-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];
    for (const model of candidateModels) {
      try {
        console.log(`[Gemini Service] Requesting model: ${model}...`);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95
              }
            })
          }
        );

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 10) {
            const scriptText = candidateText.trim();
            console.log(`[Gemini Service] ✅ ${model} generated ${scriptText.split(/\s+/).length} words.`);
            return {
              script: scriptText,
              scriptType,
              tone,
              length,
              provider: 'Google Gemini AI ⚡ Live',
              wordCount: scriptText.split(/\s+/).filter(Boolean).length
            };
          }
        } else {
          console.warn(`[Gemini Service] Model ${model} returned HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`[Gemini Service] Model ${model} failed:`, err.message);
      }
    }
  }

  // Graceful offline fallback template engine
  console.log('[Gemini Service] Using offline intelligent template synthesis fallback');
  const toneMap = {
    Professional: { greeting: 'Good morning', adj: 'distinguished', energy: 'confident', applause: 'warm round of applause' },
    Formal: { greeting: 'Respected dignitaries', adj: 'esteemed', energy: 'composed', applause: 'generous appreciation' },
    Friendly: { greeting: 'Hey everyone', adj: 'amazing', energy: 'relaxed', applause: 'big round of applause' },
    Energetic: { greeting: 'What\'s up, everyone', adj: 'incredible', energy: 'electric', applause: 'thunderous round of applause' },
    Technical: { greeting: 'Welcome, colleagues', adj: 'accomplished', energy: 'measured', applause: 'respectful acknowledgment' },
    Short: { greeting: 'Hello everyone', adj: 'wonderful', energy: 'brisk', applause: 'warm welcome' }
  };
  const tv = toneMap[tone] || toneMap.Professional;
  const targetSpeaker = speakerName || 'our distinguished guest';
  const targetTopic = speakerTopic || 'this landmark keynote';

  const generated = `[Stage Cue: Step center stage, smile warmly, make direct eye contact with delegates]

"${tv.greeting}, ${tv.adj} guests and attendees! Welcome to this special segment of **${eventName}**.

[Stage Cue: Open hand gesture towards stage entrance]

It is our privilege to invite **${targetSpeaker}**${speakerOrg ? ` representing **${speakerOrg}**` : ''} to present on **${targetTopic}**.

[Stage Cue: Lead the room with ${tv.applause}]

Please join me in welcoming them with a ${tv.applause}!"${customNotes ? `\n\n[Stage Cue: Reference notes]\n${customNotes}` : ''}`;

  return {
    script: generated,
    scriptType,
    tone,
    length,
    provider: 'Intelligent Stage Engine (Offline Mode)',
    wordCount: generated.split(/\s+/).filter(Boolean).length
  };
};
