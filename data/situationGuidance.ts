export interface SituationVerse {
  chapter: number;
  verse: number;
  contextExplanation: string;
  contextExplanationHi: string;
}

export interface Situation {
  id: string;
  emoji: string;
  label: string;
  labelHi: string;
  tagline: string;
  taglineHi: string;
  color: string;
  /** Full pool — 3 are randomly chosen each visit */
  verses: SituationVerse[];
  reflectionPrompts: string[];
  reflectionPromptsHi: string[];
}

export const SITUATIONS: Situation[] = [
  {
    id: "anxious",
    emoji: "😔",
    label: "Feeling Anxious",
    labelHi: "चिंतित महसूस करना",
    tagline: "Find stillness within the storm",
    taglineHi: "तूफान में शांति खोजें",
    color: "#6366F1",
    verses: [
      {
        chapter: 2,
        verse: 14,
        contextExplanation:
          "Pleasure and pain are temporary sensations that come and go like seasons. Your anxiety, however sharp it feels right now, is a passing wave — not a permanent reality.",
        contextExplanationHi:
          "सुख-दुःख ऋतुओं की तरह आते-जाते हैं। आपकी चिंता, चाहे अभी कितनी भी तीव्र लगे, एक गुजरती लहर है — स्थायी वास्तविकता नहीं।",
      },
      {
        chapter: 2,
        verse: 47,
        contextExplanation:
          "Focus only on your actions, not on outcomes you cannot control. This single teaching dissolves anxiety by redirecting your energy to what you can actually do right now.",
        contextExplanationHi:
          "केवल अपने कर्मों पर ध्यान दें, उन परिणामों पर नहीं जिन्हें आप नियंत्रित नहीं कर सकते। यह शिक्षा चिंता को सीधे दूर करती है।",
      },
      {
        chapter: 18,
        verse: 58,
        contextExplanation:
          "By surrendering your worries to a higher consciousness, you gain the clarity to cross over all difficulties — trust the process beyond your anxious mind.",
        contextExplanationHi:
          "अपनी चिंताओं को उच्च चेतना को सौंपकर आप स्पष्टता पाते हैं और सभी कठिनाइयों को पार करते हैं।",
      },
      {
        chapter: 6,
        verse: 35,
        contextExplanation:
          "The mind is restless by nature — Krishna acknowledges this directly. The practice is not to stop it but to train it gently, with detachment and repeated effort.",
        contextExplanationHi:
          "मन स्वभाव से चंचल है — कृष्ण इसे स्वीकार करते हैं। अभ्यास मन को रोकने का नहीं, बल्कि वैराग्य और बार-बार के प्रयास से इसे प्रशिक्षित करने का है।",
      },
      {
        chapter: 18,
        verse: 66,
        contextExplanation:
          "Surrender all anxious planning and outcomes to the divine. This is not passive giving up — it is an active choice to trust a larger intelligence working through your life.",
        contextExplanationHi:
          "सभी चिंतित योजनाओं और परिणामों को परमात्मा को सौंप दें। यह निष्क्रिय समर्पण नहीं — यह एक बड़ी बुद्धि पर सक्रिय भरोसा है।",
      },
      {
        chapter: 4,
        verse: 10,
        contextExplanation:
          "Many before you have freed themselves from passion, fear, and anger by taking refuge in this wisdom. You are walking a path that has already been walked successfully.",
        contextExplanationHi:
          "आपसे पहले कई लोग राग, भय और क्रोध से मुक्त हो चुके हैं। आप एक ऐसे मार्ग पर चल रहे हैं जो पहले ही सफलतापूर्वक चला जा चुका है।",
      },
    ],
    reflectionPrompts: [
      "What is the one thing within my control right now that I can focus on?",
      "If this worry did not exist, what would I be doing differently today?",
      "Can I sit with this uncertain feeling for a few breaths without trying to fix it?",
    ],
    reflectionPromptsHi: [
      "अभी मेरे नियंत्रण में एक चीज़ क्या है जिस पर मैं ध्यान दे सकता हूँ?",
      "अगर यह चिंता नहीं होती, तो मैं आज क्या अलग करता?",
      "क्या मैं इस अनिश्चित भावना के साथ कुछ सांसों के लिए बिना ठीक करने की कोशिश किए बैठ सकता हूँ?",
    ],
  },
  {
    id: "angry",
    emoji: "😡",
    label: "Feeling Angry",
    labelHi: "क्रोधित महसूस करना",
    tagline: "Transform fire into wisdom",
    taglineHi: "क्रोध को ज्ञान में बदलें",
    color: "#EF4444",
    verses: [
      {
        chapter: 2,
        verse: 62,
        contextExplanation:
          "Krishna traces how anger begins: dwelling on desires creates attachment, and when that attachment is thwarted, anger ignites. Seeing this chain gives you the power to interrupt it early.",
        contextExplanationHi:
          "कृष्ण बताते हैं कि क्रोध कैसे शुरू होता है: इच्छाओं पर विचार से आसक्ति बढ़ती है, और बाधित होने पर क्रोध जन्म लेता है।",
      },
      {
        chapter: 2,
        verse: 63,
        contextExplanation:
          "Uncontrolled anger destroys wisdom and judgment — the very faculties you need most in difficult moments. This verse shows the true cost of letting anger rule.",
        contextExplanationHi:
          "अनियंत्रित क्रोध ज्ञान और विवेक को नष्ट कर देता है — जो कठिन क्षणों में सबसे जरूरी हैं।",
      },
      {
        chapter: 16,
        verse: 21,
        contextExplanation:
          "Anger is one of the three gates to self-destruction. Recognizing it as an inner enemy rather than a righteous force gives you power to choose a different response.",
        contextExplanationHi:
          "क्रोध आत्म-विनाश के तीन द्वारों में से एक है। इसे एक आंतरिक शत्रु के रूप में पहचानना आपको अलग प्रतिक्रिया चुनने की शक्ति देता है।",
      },
      {
        chapter: 3,
        verse: 37,
        contextExplanation:
          "Desire is the root of anger — when desire is obstructed, anger is born. Understanding that anger comes from craving, not from the other person, shifts where you direct your energy.",
        contextExplanationHi:
          "इच्छा ही क्रोध की जड़ है — जब इच्छा बाधित होती है, क्रोध जन्म लेता है। यह समझना कि क्रोध इच्छा से आता है, आपकी ऊर्जा को सही दिशा में मोड़ता है।",
      },
      {
        chapter: 5,
        verse: 26,
        contextExplanation:
          "Those free from desire and anger, who have subdued their mind, already experience deep inner peace. Freedom from anger is not suppression — it is transcendence through self-knowledge.",
        contextExplanationHi:
          "जो इच्छा और क्रोध से मुक्त हैं, जिन्होंने मन को वश में किया है, वे गहरी आंतरिक शांति का अनुभव करते हैं। क्रोध से मुक्ति दमन नहीं — आत्मज्ञान द्वारा उत्कर्ष है।",
      },
      {
        chapter: 6,
        verse: 5,
        contextExplanation:
          "Lift yourself by your own effort — your mind is your best friend or your worst enemy depending on how you use it. In anger, your mind has become your enemy. Reclaim it.",
        contextExplanationHi:
          "अपने ही प्रयास से स्वयं को ऊपर उठाएं — मन आपका सबसे अच्छा मित्र या सबसे बड़ा शत्रु है। क्रोध में मन शत्रु बन गया है। उसे वापस जीतें।",
      },
    ],
    reflectionPrompts: [
      "What unmet need or fear is beneath this anger right now?",
      "If I respond from wisdom instead of reaction, what would I say or do?",
      "What would it feel like to release this anger without acting on it?",
    ],
    reflectionPromptsHi: [
      "इस क्रोध के नीचे कौन सी अपूर्ण जरूरत या डर है?",
      "अगर मैं प्रतिक्रिया के बजाय ज्ञान से जवाब दूं, तो मैं क्या कहूंगा या करूंगा?",
      "इस क्रोध को बिना उस पर कार्य किए छोड़ना कैसा लगेगा?",
    ],
  },
  {
    id: "career",
    emoji: "🤯",
    label: "Career Confusion",
    labelHi: "करियर की उलझन",
    tagline: "Your dharma is calling — listen",
    taglineHi: "आपका धर्म बुला रहा है — सुनें",
    color: "#F59E0B",
    verses: [
      {
        chapter: 3,
        verse: 35,
        contextExplanation:
          "Better to live your own imperfect path than to perfectly copy someone else's. Authentic work aligned with your true nature brings fulfillment that external success alone never can.",
        contextExplanationHi:
          "अपने अपूर्ण मार्ग पर चलना किसी और के मार्ग की नकल से बेहतर है। अपनी प्रकृति के अनुरूप प्रामाणिक कार्य वह संतुष्टि देता है जो बाहरी सफलता कभी नहीं दे सकती।",
      },
      {
        chapter: 18,
        verse: 47,
        contextExplanation:
          "Your unique qualities — your svadharma — point toward the work that is truly yours. Career confusion often comes from comparing your path to others' rather than looking inward.",
        contextExplanationHi:
          "आपके अद्वितीय गुण — आपका स्वधर्म — उस कार्य की ओर इशारा करते हैं जो वास्तव में आपका है। करियर की उलझन अक्सर दूसरों से तुलना करने से आती है।",
      },
      {
        chapter: 2,
        verse: 47,
        contextExplanation:
          "Stop obsessing over job titles, salaries, or status. Do the work in front of you with excellence and without attachment to how it will look to others.",
        contextExplanationHi:
          "नौकरी के पद, वेतन या प्रतिष्ठा पर जुनून छोड़ें। जो काम सामने है उसे उत्कृष्टता से करें।",
      },
      {
        chapter: 18,
        verse: 45,
        contextExplanation:
          "By being deeply devoted to one's own nature-aligned work, a person attains perfection. Excellence in your unique work is itself a form of worship.",
        contextExplanationHi:
          "अपनी प्रकृति के अनुरूप कार्य में पूर्णतः समर्पित होने से व्यक्ति सिद्धि प्राप्त करता है। अपने अनोखे कार्य में श्रेष्ठता स्वयं एक पूजा है।",
      },
      {
        chapter: 4,
        verse: 38,
        contextExplanation:
          "Nothing in this world purifies and clarifies like true knowledge — not degrees or job titles, but deep self-knowledge about who you are and what you're here to do.",
        contextExplanationHi:
          "इस संसार में ज्ञान जैसा पवित्र करने वाला कुछ नहीं है — न डिग्रियां, न पद, बल्कि गहरा आत्मज्ञान कि आप कौन हैं और यहाँ क्या करने आए हैं।",
      },
      {
        chapter: 6,
        verse: 1,
        contextExplanation:
          "True renunciation is not abandoning work but doing it without depending on its fruits for your sense of self. Work wholeheartedly today, free from attachment to tomorrow's outcome.",
        contextExplanationHi:
          "सच्चा त्याग काम छोड़ना नहीं, बल्कि उसके फलों पर आत्म-भाव निर्भर किए बिना करना है। आज पूरे मन से काम करें।",
      },
    ],
    reflectionPrompts: [
      "What kind of work makes me lose track of time — and how can I do more of it?",
      "Am I chasing someone else's definition of success, or my own?",
      "What would I choose if fear of failure or judgment didn't exist?",
    ],
    reflectionPromptsHi: [
      "कौन सा काम करने से मुझे समय का पता नहीं चलता — और मैं उसे और कैसे कर सकता हूँ?",
      "क्या मैं किसी और की सफलता की परिभाषा का पीछा कर रहा हूँ, या अपनी?",
      "अगर असफलता या आलोचना का डर न हो, तो मैं क्या चुनूंगा?",
    ],
  },
  {
    id: "heartbroken",
    emoji: "💔",
    label: "Heartbroken",
    labelHi: "दिल टूटा हुआ",
    tagline: "The soul is beyond all loss",
    taglineHi: "आत्मा सभी हानियों से परे है",
    color: "#EC4899",
    verses: [
      {
        chapter: 2,
        verse: 20,
        contextExplanation:
          "The soul — who you truly are at your deepest — was never born and can never die. What has been lost is a form, a relationship form. Your deeper self remains whole and unbroken.",
        contextExplanationHi:
          "आत्मा — जो आप वास्तव में हैं — कभी जन्मी नहीं और कभी मरती नहीं। जो खो गया है वह एक रूप है। आपका गहरा स्व संपूर्ण रहता है।",
      },
      {
        chapter: 2,
        verse: 14,
        contextExplanation:
          "This heartbreak, however sharp and real it feels, is a passing sensation. You have weathered pain before and found your footing again. Endure with patience — the tide will turn.",
        contextExplanationHi:
          "यह दर्द, चाहे कितना भी तीव्र हो, एक गुजरती अनुभूति है। आप पहले भी दर्द से गुजरे हैं और रास्ता खोजा है।",
      },
      {
        chapter: 9,
        verse: 22,
        contextExplanation:
          "To those who surrender in love and devotion, the divine provides sustenance and security. Even now, in this pain, you are being held by something larger than this loss.",
        contextExplanationHi:
          "जो प्रेम और भक्ति में समर्पित होते हैं, उन्हें परमात्मा पोषण और सुरक्षा देता है। इस दर्द में भी आप किसी बड़ी शक्ति द्वारा थामे गए हैं।",
      },
      {
        chapter: 2,
        verse: 19,
        contextExplanation:
          "Neither this loss, nor any form that comes or goes, touches the essence of who you are. The grief is real, but it does not define your worth or your wholeness.",
        contextExplanationHi:
          "न यह हानि, न आने-जाने वाला कोई रूप आपके वास्तविक स्वरूप को छूता है। दुःख वास्तविक है, लेकिन यह आपकी संपूर्णता को परिभाषित नहीं करता।",
      },
      {
        chapter: 9,
        verse: 29,
        contextExplanation:
          "The divine is equally present in all beings — in those who hurt you, in those you've lost, and in you. Pain does not mean you are abandoned; love is still the ground beneath you.",
        contextExplanationHi:
          "परमात्मा सभी प्राणियों में समान रूप से विद्यमान है — उनमें भी जिन्होंने दर्द दिया, उनमें भी जिन्हें खोया, और आपमें भी। दर्द का मतलब त्याग नहीं।",
      },
      {
        chapter: 12,
        verse: 13,
        contextExplanation:
          "The one who holds no hatred toward any being, who is compassionate — this is the quality the Gita calls divine. Heartbreak can become the doorway to this kind of open, compassionate heart.",
        contextExplanationHi:
          "जो किसी प्राणी के प्रति घृणा नहीं रखता, जो करुणामय है — गीता इसे दिव्य गुण कहती है। दिल का दर्द इस खुले, करुणामय हृदय का द्वार बन सकता है।",
      },
    ],
    reflectionPrompts: [
      "Beyond this pain, what part of me remains untouched and whole?",
      "What has this experience taught me about love, myself, or life?",
      "Can I allow myself to grieve fully without judging the feeling as weakness?",
    ],
    reflectionPromptsHi: [
      "इस दर्द से परे, मेरा कौन सा हिस्सा अछूता और संपूर्ण रहता है?",
      "इस अनुभव ने मुझे प्रेम, स्वयं या जीवन के बारे में क्या सिखाया?",
      "क्या मैं इस भावना को कमजोरी समझे बिना पूरी तरह शोक मना सकता हूँ?",
    ],
  },
  {
    id: "motivation",
    emoji: "😔",
    label: "Lost Motivation",
    labelHi: "प्रेरणा खो जाना",
    tagline: "Rise — your action is needed",
    taglineHi: "उठो — आपके कार्य की जरूरत है",
    color: "#22C55E",
    verses: [
      {
        chapter: 2,
        verse: 3,
        contextExplanation:
          "Krishna firmly tells Arjuna: do not yield to this weakness. Inaction born of despair is not humility or wisdom — it is simply fear wearing the mask of exhaustion.",
        contextExplanationHi:
          "कृष्ण अर्जुन से दृढ़ता से कहते हैं: इस कमजोरी के आगे मत झुको। निराशा से जन्मी निष्क्रियता थकान का मुखौटा पहना हुआ डर मात्र है।",
      },
      {
        chapter: 11,
        verse: 33,
        contextExplanation:
          "You have already been destined for your purpose — the work is waiting for you. Your presence and participation in life matter far more than you may feel right now.",
        contextExplanationHi:
          "आप पहले से ही अपने उद्देश्य के लिए नियत हैं — काम आपकी प्रतीक्षा कर रहा है। आपकी उपस्थिति अभी आपको जितनी महसूस हो रही है उससे कहीं अधिक महत्वपूर्ण है।",
      },
      {
        chapter: 3,
        verse: 8,
        contextExplanation:
          "Action — even imperfect, small action — is always better than paralysis. Begin the smallest possible step today. Momentum builds from motion, never from waiting to feel ready.",
        contextExplanationHi:
          "कार्य — चाहे अपूर्ण, छोटा ही हो — हमेशा लकवे से बेहतर है। आज सबसे छोटा कदम उठाएं। गति से गतिशीलता बनती है, तैयार महसूस होने के इंतजार से नहीं।",
      },
      {
        chapter: 3,
        verse: 19,
        contextExplanation:
          "By performing action without attachment to results, great souls have attained their highest. You do not need to feel inspired to act — act first, and inspiration often follows.",
        contextExplanationHi:
          "परिणामों की आसक्ति के बिना कर्म करके महान आत्माओं ने सर्वोच्च प्राप्त किया है। प्रेरित महसूस करने की जरूरत नहीं — पहले कार्य करें, प्रेरणा अक्सर पीछे आती है।",
      },
      {
        chapter: 6,
        verse: 5,
        contextExplanation:
          "Lift yourself by your own effort. No one else can restore your motivation — but your own focused mind, turned inward and upward, absolutely can.",
        contextExplanationHi:
          "अपने ही प्रयास से स्वयं को उठाएं। कोई और आपकी प्रेरणा वापस नहीं ला सकता — लेकिन आपका स्वयं का एकाग्र मन, अंदर और ऊपर की ओर मुड़ा हुआ, बिल्कुल कर सकता है।",
      },
      {
        chapter: 18,
        verse: 48,
        contextExplanation:
          "Do not abandon the work born of your own nature, even if it has flaws. All worthy endeavors have difficulties. Showing up imperfectly is still showing up.",
        contextExplanationHi:
          "अपनी प्रकृति से उत्पन्न कार्य को मत छोड़ो, चाहे उसमें दोष हों। सभी सार्थक प्रयासों में कठिनाइयाँ आती हैं। अपूर्ण रूप से उपस्थित होना भी उपस्थित होना है।",
      },
    ],
    reflectionPrompts: [
      "What is the tiniest action I can take today — not tomorrow, today?",
      "Is my lack of motivation protecting me from something, or holding me back from something?",
      "Who in my life might benefit if I choose to show up fully right now?",
    ],
    reflectionPromptsHi: [
      "सबसे छोटी कार्रवाई क्या है जो मैं आज कर सकता हूँ — कल नहीं, आज?",
      "क्या मेरी प्रेरणा की कमी मुझे किसी चीज़ से बचा रही है, या किसी चीज़ से रोक रही है?",
      "मेरे जीवन में कौन लाभान्वित हो सकता है अगर मैं अभी पूरी तरह से उपस्थित होना चुनूं?",
    ],
  },
  {
    id: "fearful",
    emoji: "😨",
    label: "Feeling Fearful",
    labelHi: "भयभीत महसूस करना",
    tagline: "Courage lives in the present",
    taglineHi: "साहस वर्तमान में जीता है",
    color: "#8B5CF6",
    verses: [
      {
        chapter: 4,
        verse: 10,
        contextExplanation:
          "Many before you have faced fear, surrendered their attachment to outcomes, and found liberation. Fear loses its power the moment you stop being enslaved to a particular result.",
        contextExplanationHi:
          "आपसे पहले कई लोगों ने डर का सामना किया, परिणामों की आसक्ति छोड़ी, और मुक्ति पाई। जैसे ही आप किसी विशेष परिणाम के दास नहीं रहते, डर अपनी शक्ति खो देता है।",
      },
      {
        chapter: 2,
        verse: 40,
        contextExplanation:
          "Even a little spiritual practice — even a single courageous step — is never wasted. You lose nothing by acting from your highest self. Every right-direction effort protects you.",
        contextExplanationHi:
          "थोड़ा भी आध्यात्मिक अभ्यास — एक साहसी कदम भी — कभी व्यर्थ नहीं जाता। अपने उच्चतम स्व से कार्य करने में आप कुछ नहीं खोते।",
      },
      {
        chapter: 18,
        verse: 58,
        contextExplanation:
          "Surrender the fear to a higher intelligence. When you stop white-knuckling control over every outcome, grace carries you through what feels impossible to face alone.",
        contextExplanationHi:
          "डर को उच्च बुद्धि को सौंप दें। जब आप हर परिणाम पर नियंत्रण छोड़ते हैं, कृपा आपको असंभव लगने वाले से पार ले जाती है।",
      },
      {
        chapter: 12,
        verse: 15,
        contextExplanation:
          "One who neither disturbs the world nor is disturbed by it — who is free from fear and anxiety — is held dear. Inner freedom from fear is possible, not just theoretical.",
        contextExplanationHi:
          "जो न संसार को कष्ट देता है, न संसार से कष्ट पाता है — जो भय और चिंता से मुक्त है — वह प्रिय है। भय से आंतरिक स्वतंत्रता संभव है।",
      },
      {
        chapter: 18,
        verse: 66,
        contextExplanation:
          "This is the Gita's deepest promise: surrender all — including your fears — and you will be freed from all forms of harm. Not as an escape from life, but as a liberation within it.",
        contextExplanationHi:
          "यह गीता का सबसे गहरा वचन है: सब कुछ — अपने भय सहित — सौंप दो, और तुम सभी प्रकार के अनिष्ट से मुक्त हो जाओगे।",
      },
      {
        chapter: 9,
        verse: 22,
        contextExplanation:
          "For those who are devoted and trust a larger intelligence, their needs are sustained and their losses restored. You are not alone in what you fear — a greater force walks with you.",
        contextExplanationHi:
          "जो समर्पित हैं और बड़ी बुद्धि पर भरोसा रखते हैं, उनकी जरूरतें पूरी होती हैं। जो आप डरते हैं उसमें आप अकेले नहीं हैं।",
      },
    ],
    reflectionPrompts: [
      "What is the worst realistic outcome — and could I survive and grow through it?",
      "What am I assuming will happen that may not actually be true?",
      "If I acted despite this fear, what would that one brave step look like?",
    ],
    reflectionPromptsHi: [
      "सबसे बुरा यथार्थवादी परिणाम क्या है — और क्या मैं उसे झेल और उससे बढ़ सकता हूँ?",
      "मैं क्या मान रहा हूँ जो वास्तव में सच नहीं हो सकता?",
      "अगर मैं इस डर के बावजूद कार्य करूं, तो वह एक साहसी कदम कैसा दिखेगा?",
    ],
  },
];

export function getSituation(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}

/** Pick `count` random indices from a pool of `total`, optionally excluding already-shown ones */
export function pickRandomIndices(
  total: number,
  count: number,
  exclude: number[] = []
): number[] {
  const pool = Array.from({ length: total }, (_, i) => i).filter(
    (i) => !exclude.includes(i)
  );
  // Fisher-Yates shuffle on the available pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // If exclusion leaves too few, fill remainder from excluded indices
  if (pool.length < count) {
    const fallback = exclude.slice(0, count - pool.length);
    return [...pool, ...fallback];
  }
  return pool.slice(0, count);
}

export interface SavedGuidance {
  id: string;
  situationId: string;
  situationLabel: string;
  situationEmoji: string;
  savedAt: string;
}

export const GUIDANCE_STORAGE_KEY = "personal_guidance_v1";
