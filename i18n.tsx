
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Language } from './types';

// FIX: Added the full implementation for the internationalization provider and hook.
// This resolves the "has no exported member" errors in multiple files by correctly
// exporting `I18nProvider` and `useTranslation`.

type Translations = {
  [key in Language]: {
    [key: string]: any;
  };
};

const translations: Translations = {
  en: {
    login: {
      titleLogin: "Welcome Back",
      titleSignup: "Create an Account",
      description: "Access the AI Oceanographer. Admins manage knowledge, users explore insights.",
      emailPlaceholder: "Email Address",
      passwordPlaceholder: "Password",
      usernamePlaceholder: "Username",
      loginButton: "Login",
      signupButton: "Sign Up",
      switchToSignup: "Don't have an account?",
      switchToLogin: "Already have an account?",
      roleLabel: "Sign up as a:",
      roleUser: "User",
      roleAdmin: "Admin",
    },
    welcome: {
      title: "Welcome to MARINOVA",
      subtitle: "Your personal AI oceanographer. Ask questions in plain language and watch as complex ocean data comes to life through interactive maps, charts, and summaries.",
      button: "Explore the Depths"
    },
    app: {
        subHeader: "AI Ocean Data Explorer",
        welcomeMessage: "Hello! I'm MARINOVA, your AI oceanographer. Navigate to the 'Chat' page to ask me anything about the world's oceans!"
    },
    sidebar: {
      dashboard: "Dashboard",
      chat: "Chat",
      visualization: "Visualization",
      intelligence: "Ocean Intelligence",
      reports: "Reports",
      insightPrediction: "AI Insights",
      liveConversation: "Live Conversation",
      videoGeneration: "Video Generation",
      admin: "Admin Panel"
    },
    dashboard: {
        widgets: {
            seaTemp: { title: "Global Sea Temp", trend: "+0.02°C this month" },
            seaLevel: { title: "Sea Level Rise", trend: "Accelerating" },
            acidity: { title: "Ocean Acidity", trend: "Decreasing" },
            argo: { title: "ARGO Floats", trend: "Online & Reporting" }
        },
        oceans: {
            title: "Live Ocean Metrics",
            pacific: "Pacific Ocean",
            atlantic: "Atlantic Ocean",
            indian: "Indian Ocean",
            southern: "Southern Ocean",
            arctic: "Arctic Ocean",
            metrics: {
              temperature: "Temperature",
              salinity: "Salinity",
              current: "Current",
              acidity: "Acidity",
              waveHeight: "Wave Height"
            }
        }
    },
    chat: {
        placeholder: "Ask about the ocean...",
        playAudio: "Play audio"
    },
    visualization: {
        loading: "Analyzing data streams...",
        empty: {
            title: "Ocean Visualizer",
            description: "Your requested visualizations will appear here. Ask me a question like \"Show me a chart of sea level rise over the last 20 years\" or \"Generate a 3D model of a blue whale\" to get started!"
        },
        awaiting: {
            title: "Awaiting Analysis"
        }
    },
    intelligence: {
        loading: "Synthesizing intelligence...",
        empty: {
            title: "Real-Time Ocean Intelligence",
            description: "When you request data, this hub will provide a unified, real-time understanding of ocean ecosystems, including live detections, anomalies, and predictive forecasts."
        },
        briefing: "Situational Briefing",
        detections: "Live Detections",
        anomalies: "Environmental Anomalies",
        forecast: "Predictive Forecast",
        confidence: "Confidence"
    },
    reports: {
        title: "Dynamic Ocean Reports",
        description: "Ask any question to generate a comprehensive, AI-powered report on any oceanographic topic, complete with analysis, images, and data visualizations.",
        searchPlaceholder: "Ask about any ocean topic...",
        loading: "Generating a detailed report from our live data streams...",
    },
    insightPrediction: {
        title: "AI Insights & Predictions",
        description: "Leveraging predictive models and real-time data streams, MARINOVA provides proactive forecasts on key ecological events and trends.",
        cards: {
            coralBleaching: {
                title: "Coral Bleaching Forecast",
                description: "Elevated sea surface temperatures in the Andaman Sea are creating conditions favorable for a coral bleaching event. Models predict a high probability of widespread bleaching if temperatures do not decrease.",
                timeframe: "Next 14-21 Days"
            },
            plasticDrift: {
                title: "Plastic Debris Drift Model",
                description: "A significant plastic debris field has been identified in the Indian Ocean. Current models predict it will drift southeast, potentially impacting marine conservation areas off the coast of Australia.",
                timeframe: "Next 30-45 Days"
            },
            algalBloom: {
                title: "Algal Bloom Probability",
                description: "Increased nutrient runoff detected along the coast of Oman, combined with warming waters, suggests a medium probability of a harmful algal bloom (HAB) developing, which could impact local fisheries.",
                timeframe: "Next 7 Days"
            }
        }
    },
    liveConversation: {
        title: "Live AI Conversation",
        description: "Speak directly with MARINOVA. Ask your questions and get real-time audio responses. Your conversation will be transcribed below.",
        start: "Start Talking",
        stop: "Stop Conversation",
        status: {
            idle: "Click 'Start Talking' to begin",
            connecting: "Connecting to AI...",
            listening: "Listening...",
            error: "Connection error. Please try again."
        },
        user: "You",
        bot: "MARINOVA"
    },
    videoGeneration: {
        title: "AI Video Generation",
        description: "Create a short video from an image and a text prompt using Veo. Start by uploading an image.",
        upload: "Upload an Image",
        promptPlaceholder: "Describe what should happen in the video...",
        aspectRatio: "Aspect Ratio",
        generate: "Generate Video",
        generatingTitle: "Generating your video...",
        generatingMessages: "Initializing AI video synthesis...\nAnalyzing image and prompt context...\nRendering keyframes and motion vectors...\nThis can take a few minutes. Please wait.\nUpscaling video to high definition...\nFinalizing video stream...",
        error: "An error occurred during video generation. Please try again.",
        selectKey: {
            title: "API Key Required for Video Generation",
            description: "The Veo model requires a user-selected API key. Please select a key to proceed. This is a mandatory step.",
            button: "Select API Key",
            billing: "For information on billing, please visit the documentation."
        }
    },
    admin: {
        title: "Knowledge Base Management",
        description: "Upload a PDF document to serve as the exclusive knowledge base for all AI responses. While a document is active, the AI will only answer questions based on its content.",
        upload: "Upload Knowledge PDF",
        currentKnowledge: "Current Knowledge Base:",
        noKnowledge: "No knowledge base is currently active. The AI is using its general model.",
        changeFile: "Change File",
        clearKnowledge: "Clear Knowledge Base",
        fileReady: "is ready. The AI will now use this document.",
        indexing: "Indexing document... This may take a moment.",
        indexingSteps: {
            extracting: "Step 1/3: Extracting text from PDF...",
            chunking: "Step 2/3: Chunking text content...",
            embedding: "Step 3/3: Generating vector embeddings...",
            done: "Indexing complete. {{chunks}} chunks created."
        }
    },
    suggestions: {
        header: "Here are some things you could ask next:"
    },
    error: {
        prefix: "Sorry, I encountered an error: ",
        botMessage: "I seem to be having trouble connecting to my sensors. Please try again later. Error: "
    }
  },
  hi: {
    login: {
      titleLogin: "वापसी पर स्वागत है",
      titleSignup: "खाता बनाएं",
      description: "एआई ओशनोग्राफर तक पहुंचें। एडमिन ज्ञान का प्रबंधन करते हैं, उपयोगकर्ता अंतर्दृष्टि का पता लगाते हैं।",
      emailPlaceholder: "ईमेल पता",
      passwordPlaceholder: "पासवर्ड",
      usernamePlaceholder: "उपयोगकर्ता नाम",
      loginButton: "लॉग इन करें",
      signupButton: "साइन अप करें",
      switchToSignup: "खाता नहीं है?",
      switchToLogin: "पहले से ही एक खाता है?",
      roleLabel: "के रूप में साइन अप करें:",
      roleUser: "उपयोगकर्ता",
      roleAdmin: "एडमिन",
    },
    welcome: {
      title: "मारिनोवा में आपका स्वागत है",
      subtitle: "आपका व्यक्तिगत AI समुद्र विज्ञानी। सरल भाषा में प्रश्न पूछें और देखें कि जटिल समुद्री डेटा इंटरैक्टिव मानचित्रों, चार्टों और सारांशों के माध्यम से कैसे जीवंत होता है।",
      button: "गहराइयों का अन्वेषण करें"
    },
    app: {
        subHeader: "एआई ओशन डेटा एक्सप्लोरर",
        welcomeMessage: "नमस्ते! मैं मारिनोवा हूँ, आपका AI समुद्र विज्ञानी। दुनिया के महासागरों के बारे में कुछ भी पूछने के लिए 'चैट' पेज पर जाएँ!"
    },
    sidebar: {
      dashboard: "डैशबोर्ड",
      chat: "चैट",
      visualization: "विज़ुअलाइज़ेशन",
      intelligence: "महासागर इंटेलिजेंस",
      reports: "रिपोर्ट्स",
      insightPrediction: "एआई अंतर्दृष्टि",
      liveConversation: "लाइव बातचीत",
      videoGeneration: "वीडियो जनरेशन",
      admin: "एडमिन पैनल"
    },
    dashboard: {
        widgets: {
            seaTemp: { title: "वैश्विक समुद्री तापमान", trend: "+0.02°C इस महीने" },
            seaLevel: { title: "समुद्र स्तर में वृद्धि", trend: "तेजी से बढ़ रहा है" },
            acidity: { title: "महासागर की अम्लता", trend: "घट रही है" },
            argo: { title: "आर्गो फ्लोट्स", trend: "ऑनलाइन और रिपोर्टिंग" }
        },
        oceans: {
            title: "लाइव महासागर मेट्रिक्स",
            pacific: "प्रशांत महासागर",
            atlantic: "अटलांटिक महासागर",
            indian: "हिंद महासागर",
            southern: "दक्षिणी महासागर",
            arctic: "आर्कटिक महासागर",
            metrics: {
              temperature: "तापमान",
              salinity: "लवणता",
              current: "धारा",
              acidity: "अम्लता",
              waveHeight: "लहर की ऊंचाई"
            }
        }
    },
    chat: {
        placeholder: "महासागर के बारे में पूछें...",
        playAudio: "ऑडियो चलाएं"
    },
    visualization: {
        loading: "डेटा स्ट्रीम का विश्लेषण हो रहा है...",
        empty: {
            title: "ओशन विज़ुअलाइज़र",
            description: "आपके अनुरोधित विज़ुअलाइज़ेशन यहाँ दिखाई देंगे। शुरू करने के लिए मुझसे \"पिछले 20 वर्षों में समुद्र स्तर में वृद्धि का चार्ट दिखाएं\" या \"ब्लू व्हेल का 3D मॉडल बनाएं\" जैसा प्रश्न पूछें!"
        },
        awaiting: {
            title: "विश्लेषण की प्रतीक्षा है"
        }
    },
    intelligence: {
        loading: "इंटेलिजेंस संश्लेषित हो रही है...",
        empty: {
            title: "रीयल-टाइम महासागर इंटेलिजेंस",
            description: "जब आप डेटा का अनुरोध करते हैं, तो यह हब समुद्री पारिस्थितिक तंत्र की एक एकीकृत, रीयल-टाइम समझ प्रदान करेगा, जिसमें लाइव डिटेक्शन, विसंगतियाँ और पूर्वानुमान शामिल हैं।"
        },
        briefing: "स्थिति संबंधी ब्रीफिंग",
        detections: "लाइव डिटेक्शन",
        anomalies: "पर्यावरणीय विसंगतियाँ",
        forecast: "भविष्यवाणी पूर्वानुमान",
        confidence: "विश्वसनीयता"
    },
     reports: {
        title: "गतिशील महासागर रिपोर्ट",
        description: "किसी भी समुद्र विज्ञान विषय पर एक व्यापक, AI-संचालित रिपोर्ट उत्पन्न करने के लिए कोई भी प्रश्न पूछें, जो विश्लेषण, छवियों और डेटा विज़ुअलाइज़ेशन के साथ पूर्ण हो।",
        searchPlaceholder: "किसी भी महासागर विषय के बारे में पूछें...",
        loading: "हमारे लाइव डेटा स्ट्रीम से एक विस्तृत रिपोर्ट तैयार की जा रही है...",
    },
    insightPrediction: {
        title: "एआई अंतर्दृष्टि और भविष्यवाणियां",
        description: "भविष्य कहनेवाला मॉडल और रीयल-टाइम डेटा धाराओं का लाभ उठाते हुए, मारिनोवा प्रमुख पारिस्थितिक घटनाओं और प्रवृत्तियों पर सक्रिय पूर्वानुमान प्रदान करता है।",
        cards: {
            coralBleaching: {
                title: "कोरल ब्लीचिंग पूर्वानुमान",
                description: "अंडमान सागर में समुद्र की सतह का ऊंचा तापमान कोरल ब्लीचिंग घटना के लिए अनुकूल परिस्थितियां बना रहा है। मॉडल भविष्यवाणी करते हैं कि यदि तापमान कम नहीं होता है तो व्यापक ब्लीचिंग की उच्च संभावना है।",
                timeframe: "अगले 14-21 दिन"
            },
            plasticDrift: {
                title: "प्लास्टिक मलबे का बहाव मॉडल",
                description: "हिंद महासागर में एक महत्वपूर्ण प्लास्टिक मलबे के क्षेत्र की पहचान की गई है। वर्तमान मॉडल भविष्यवाणी करते हैं कि यह दक्षिण-पूर्व की ओर बहेगा, जिससे ऑस्ट्रेलिया के तट पर समुद्री संरक्षण क्षेत्रों पर संभावित रूप से प्रभाव पड़ सकता है।",
                timeframe: "अगले 30-45 दिन"
            },
            algalBloom: {
                title: "शैवाल खिलने की संभावना",
                description: "ओमान के तट पर बढ़े हुए पोषक तत्वों के अपवाह का पता चला है, जो गर्म पानी के साथ मिलकर, हानिकारक शैवाल खिलने (एचएबी) के विकास की मध्यम संभावना का सुझाव देता है, जो स्थानीय मत्स्य पालन को प्रभावित कर सकता है।",
                timeframe: "अगले 7 दिन"
            }
        }
    },
     liveConversation: {
        title: "लाइव AI बातचीत",
        description: "मारिनोवा से सीधे बात करें। अपने प्रश्न पूछें और रीयल-टाइम ऑडियो प्रतिक्रियाएँ प्राप्त करें। आपकी बातचीत नीचे लिखी जाएगी।",
        start: "बात करना शुरू करें",
        stop: "बातचीत बंद करें",
        status: {
            idle: "शुरू करने के लिए 'बात करना शुरू करें' पर क्लिक करें",
            connecting: "AI से कनेक्ट हो रहा है...",
            listening: "सुन रहा है...",
            error: "कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।"
        },
        user: "आप",
        bot: "मारिनोवा"
    },
    videoGeneration: {
        title: "AI वीडियो जनरेशन",
        description: "Veo का उपयोग करके एक छवि और एक टेक्स्ट प्रॉम्प्ट से एक छोटा वीडियो बनाएं। एक छवि अपलोड करके प्रारंभ करें।",
        upload: "एक छवि अपलोड करें",
        promptPlaceholder: "वीडियो में क्या होना चाहिए उसका वर्णन करें...",
        aspectRatio: "पहलू अनुपात",
        generate: "वीडियो बनाएं",
        generatingTitle: "आपका वीडियो बनाया जा रहा है...",
        generatingMessages: "AI वीडियो संश्लेषण शुरू हो रहा है...\nछवि और प्रॉम्प्ट संदर्भ का विश्लेषण हो रहा है...\nकीफ़्रेम और मोशन वैक्टर प्रस्तुत किए जा रहे हैं...\nइसमें कुछ मिनट लग सकते हैं। कृपया प्रतीक्षा करें।\nवीडियो को उच्च परिभाषा में अपस्केल किया जा रहा है...\nवीडियो स्ट्रीम को अंतिम रूप दिया जा रहा है...",
        error: "वीडियो बनाने के दौरान एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
        selectKey: {
            title: "वीडियो जनरेशन के लिए API कुंजी आवश्यक है",
            description: "Veo मॉडल के लिए उपयोगकर्ता-चयनित API कुंजी की आवश्यकता होती है। कृपया आगे बढ़ने के लिए एक कुंजी चुनें। यह एक अनिवार्य कदम है।",
            button: "API कुंजी चुनें",
            billing: "बिलिंग पर जानकारी के लिए, कृपया दस्तावेज़ देखें।"
        }
    },
    admin: {
        title: "ज्ञान आधार प्रबंधन",
        description: "सभी AI प्रतिक्रियाओं के लिए विशेष ज्ञान आधार के रूप में काम करने के लिए एक PDF दस्तावेज़ अपलोड करें। जब कोई दस्तावेज़ सक्रिय होता है, तो AI केवल उसकी सामग्री के आधार पर सवालों का जवाब देगा।",
        upload: "ज्ञान PDF अपलोड करें",
        currentKnowledge: "वर्तमान ज्ञान आधार:",
        noKnowledge: "वर्तमान में कोई ज्ञान आधार सक्रिय नहीं है। AI अपने सामान्य मॉडल का उपयोग कर रहा है।",
        changeFile: "फ़ाइल बदलें",
        clearKnowledge: "ज्ञान आधार साफ़ करें",
        fileReady: "तैयार है। AI अब इस दस्तावेज़ का उपयोग करेगा।",
        indexing: "दस्तावेज़ को अनुक्रमित किया जा रहा है... इसमें कुछ समय लग सकता है।",
        indexingSteps: {
            extracting: "चरण 1/3: PDF से टेक्स्ट निकाला जा रहा है...",
            chunking: "चरण 2/3: टेक्स्ट सामग्री को चंक किया जा रहा है...",
            embedding: "चरण 3/3: वेक्टर एम्बेडिंग उत्पन्न की जा रही है...",
            done: "अनुक्रमण पूरा हुआ। {{chunks}} चंक्स बनाए गए।"
        }
    },
    suggestions: {
        header: "यहाँ कुछ चीज़ें हैं जो आप आगे पूछ सकते हैं:"
    },
    error: {
        prefix: "क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा: ",
        botMessage: "लगता है मुझे अपने सेंसर से कनेक्ट होने में समस्या आ रही है। कृपया बाद में पुनः प्रयास करें। त्रुटि: "
    }
  },
  ar: {
    login: {
      titleLogin: "مرحبا بعودتك",
      titleSignup: "إنشاء حساب",
      description: "الوصول إلى عالم المحيطات الذكي. المسؤولون يديرون المعرفة، والمستخدمون يستكشفون الرؤى.",
      emailPlaceholder: "عنوان البريد الإلكتروني",
      passwordPlaceholder: "كلمة المرور",
      usernamePlaceholder: "اسم المستخدم",
      loginButton: "تسجيل الدخول",
      signupButton: "إنشاء حساب",
      switchToSignup: "ليس لديك حساب؟",
      switchToLogin: "هل لديك حساب بالفعل؟",
      roleLabel: "التسجيل كـ:",
      roleUser: "مستخدم",
      roleAdmin: "مسؤول",
    },
    welcome: {
      title: "أهلاً بك في مارينوفا",
      subtitle: "عالم المحيطات الذكي الشخصي الخاص بك. اطرح الأسئلة بلغة بسيطة وشاهد كيف تنبض بيانات المحيطات المعقدة بالحياة من خلال الخرائط والرسوم البيانية والملخصات التفاعلية.",
      button: "استكشف الأعماق"
    },
     app: {
        subHeader: "مستكشف بيانات المحيطات بالذكاء الاصطناعي",
        welcomeMessage: "أهلاً! أنا مارينوفا، عالم المحيطات الذكي الخاص بك. انتقل إلى صفحة 'الدردشة' لتسألني أي شيء عن محيطات العالم!"
    },
    sidebar: {
      dashboard: "لوحة التحكم",
      chat: "دردشة",
      visualization: "تصور",
      intelligence: "استخبارات المحيطات",
      reports: "تقارير",
      insightPrediction: "رؤى الذكاء الاصطناعي",
      liveConversation: "محادثة مباشرة",
      videoGeneration: "إنشاء فيديو",
      admin: "لوحة الإدارة"
    },
    dashboard: {
        widgets: {
            seaTemp: { title: "حرارة البحار العالمية", trend: "+0.02°م هذا الشهر" },
            seaLevel: { title: "ارتفاع مستوى سطح البحر", trend: "متسارع" },
            acidity: { title: "حموضة المحيطات", trend: "في انخفاض" },
            argo: { title: "عوامات ARGO", trend: "متصلة وترسل البيانات" }
        },
        oceans: {
            title: "مقاييس المحيط الحية",
            pacific: "المحيط الهادئ",
            atlantic: "المحيط الأطلسي",
            indian: "المحيط الهندي",
            southern: "المحيط الجنوبي",
            arctic: "المحيط المتجمد الشمالي",
            metrics: {
              temperature: "درجة الحرارة",
              salinity: "الملوحة",
              current: "التيار",
              acidity: "الحموضة",
              waveHeight: "ارتفاع الموج"
            }
        }
    },
    chat: {
        placeholder: "اسأل عن المحيط...",
        playAudio: "تشغيل الصوت"
    },
    visualization: {
        loading: "جاري تحليل تدفقات البيانات...",
        empty: {
            title: "مصور المحيطات",
            description: "ستظهر تصوراتك المطلوبة هنا. اطرح علي سؤالاً مثل \"أرني مخططًا لارتفاع مستوى سطح البحر على مدار العشرين عامًا الماضية\" أو \"أنشئ نموذجًا ثلاثي الأبعاد لحوت أزرق\" للبدء!"
        },
        awaiting: {
            title: "في انتظار التحليل"
        }
    },
    intelligence: {
        loading: "جاري تجميع المعلومات الاستخباراتية...",
        empty: {
            title: "استخبارات المحيطات في الوقت الفعلي",
            description: "عند طلب البيانات، سيوفر هذا المركز فهمًا موحدًا وفي الوقت الفعلي للنظم البيئية للمحيطات، بما في ذلك الكشف المباشر والشذوذ والتنبؤات."
        },
        briefing: "إحاطة موقفية",
        detections: "الكشف المباشر",
        anomalies: "الشذوذ البيئي",
        forecast: "توقعات تنبؤية",
        confidence: "الثقة"
    },
    reports: {
        title: "تقارير المحيطات الديناميكية",
        description: "اطرح أي سؤال لإنشاء تقرير شامل ومدعوم بالذكاء الاصطناعي حول أي موضوع يتعلق بعلوم المحيطات، مع استكماله بالتحليلات والصور وتصورات البيانات.",
        searchPlaceholder: "اسأل عن أي موضوع في المحيط...",
        loading: "جاري إنشاء تقرير مفصل من تدفقات البيانات الحية لدينا...",
    },
  },
  ml: {}, // Placeholder for Malayalam
};

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    const getDeepValue = (obj: any, path: string[]) => {
      return path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : undefined, obj);
    }

    let translation = getDeepValue(translations[language], keys);
    
    if (translation === undefined) {
        translation = getDeepValue(translations.en, keys);
    }

    if (translation === undefined) {
        return key;
    }
    
    let result = String(translation);

    if (options) {
      result = Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(`{{${optKey}}}`, String(optValue));
      }, result);
    }
    
    return result;
  }, [language]);

  const value = { language, setLanguage, t };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
