import { GoogleGenAI, Type, Modality } from '@google/genai';
import { ChatMessage, GeminiResponse, VisualizationType, Language, OceanIntelligenceReport, VisualizationType as VisType, VectorDBEntry, DetailedReport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';
const embeddingModel = 'text-embedding-004';

// --- Vector Math Utilities ---
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (vecA.length !== vecB.length) return 0;
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
};

// --- Text Processing Utilities ---
export const chunkText = (text: string, chunkSize = 512, overlap = 50): string[] => {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
        const end = Math.min(i + chunkSize, text.length);
        chunks.push(text.slice(i, end));
        i += chunkSize - overlap;
        if (i >= text.length - overlap && end < text.length) {
            chunks.push(text.slice(end - overlap));
            break;
        }
    }
    return chunks;
};


// --- Gemini API Services ---

export const extractTextFromPdf = async (file: {type: string, data: string}): Promise<string> => {
    try {
        const base64Data = file.data.split(',')[1];
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { mimeType: file.type, data: base64Data } },
                    { text: "Extract all text content from the provided document. Respond only with the raw text, without any additional explanation or formatting." }
                ]
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from the provided document.");
    }
};

export const generateEmbeddings = async (chunks: string[]): Promise<number[][]> => {
    try {
        const response = await ai.models.batchEmbedContents({
            model: embeddingModel,
            requests: chunks.map(chunk => ({ content: chunk }))
        });
        return response.embeddings.map(e => e.values);
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error("Failed to generate embeddings for the document.");
    }
};

const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const response = await ai.models.embedContent({
            model: embeddingModel,
            content: text,
        });
        return response.embedding.values;
    } catch (error) {
        console.error("Error generating single embedding:", error);
        throw new Error("Failed to generate embedding for the query.");
    }
};

const findRelevantChunks = (queryEmbedding: number[], vectorDB: VectorDBEntry[], topK = 3) => {
    const scoredChunks = vectorDB.map(entry => ({
        ...entry,
        score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "A friendly, narrative explanation of the data, written from the perspective of an AI oceanographer named MARINOVA. Explain what the visualization shows in simple terms. If the request cannot be fulfilled, explain why in a helpful tone."
    },
    visualizationType: {
      type: Type.STRING,
      enum: ['MAP', 'CHART', 'LAYERS', 'THREE_D_MODEL', 'NONE'],
      description: "The type of visualization most appropriate for the user's query. Use 'CHART' for time-series or comparisons, 'MAP' for geographic data, 'LAYERS' for depth-related queries, 'THREE_D_MODEL' for representing marine species or underwater objects, and 'NONE' if no visualization is applicable."
    },
    visualizationTitle: {
        type: Type.STRING,
        description: "A concise, descriptive title for the visualization. For example, 'Sea Surface Temperature in the Arabian Sea (2010-2024)' or '3D Model of a Humpback Whale'."
    },
    visualizationData: {
      type: Type.OBJECT,
      description: "A JSON object containing the mock data for the visualization. The structure depends on visualizationType.",
      properties: {
        map: {
            type: Type.OBJECT,
            description: "Data for an interactive map visualization. Required if visualizationType is 'MAP'.",
            properties: {
                center: { type: Type.OBJECT, properties: { lat: {type: Type.NUMBER}, lon: {type: Type.NUMBER} }, description: "The central latitude and longitude of the map."},
                zoom: { type: Type.NUMBER, description: "The zoom level of the map, from 1 to 10."},
                dataType: { type: Type.STRING, description: "The type of data being shown, e.g., 'Salinity'."},
                points: {
                    type: Type.ARRAY,
                    description: "An array of data points to display on the map.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            lat: { type: Type.NUMBER, description: "Latitude of the data point."},
                            lon: { type: Type.NUMBER, description: "Longitude of the data point."},
                            label: { type: Type.STRING, description: "A short label for the data point."},
                            value: { type: Type.STRING, description: "The value at this point, e.g., '34.5 PSU'."}
                        }
                    }
                }
            }
        },
        chart: {
            type: Type.OBJECT,
            description: "Data for a chart visualization. Required if visualizationType is 'CHART'.",
            properties: {
                yAxisLabel: { type: Type.STRING, description: "The label for the Y-axis, e.g., 'Temperature (°C)'."},
                series1Name: { type: Type.STRING, description: "The name of the primary data series."},
                series2Name: { type: Type.STRING, description: "The name of the optional secondary data series."},
                data: {
                    type: Type.ARRAY,
                    description: "An array of data objects for the chart.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING, description: "The label for the data point (e.g., a year or a location)." },
                            value1: { type: Type.NUMBER, description: "The primary value for the data point (e.g., temperature)." },
                            value2: { type: Type.NUMBER, description: "An optional second value for comparison charts." }
                        }
                    }
                }
            }
        },
        layers: {
            type: Type.OBJECT,
            description: "Data for ocean layers. Required if visualizationType is 'LAYERS'.",
            properties: {
                surface: { type: Type.STRING, description: "Description of the surface layer (0-200m)." },
                mid: { type: Type.STRING, description: "Description of the mid-layer (200-1000m)." },
                deep: { type: Type.STRING, description: "Description of the deep layer (>1000m)." }
            }
        },
        threeDModel: {
            type: Type.OBJECT,
            description: "Data for a 3D model representation. Required if visualizationType is 'THREE_D_MODEL'.",
            properties: {
                modelName: { type: Type.STRING, description: "The name of the object or species being modeled, e.g., 'Humpback Whale'."},
                description: { type: Type.STRING, description: "A brief description of the model."},
                imageSeed: { type: Type.STRING, description: "A seed string for generating a representative image. E.g., 'humpbackwhale3d'."}
            }
        }
      }
    },
    intelligenceReport: {
        type: Type.OBJECT,
        description: "A real-time intelligence report based on simulated data streams from sensors, satellites, and cameras.",
        properties: {
            situationalBriefing: {
                type: Type.STRING,
                description: "A concise, generative AI-powered summary explaining the overall situation in plain language. Example: 'Dolphin pods detected near Bay of Bengal moving northward due to rising temperatures.'"
            },
            liveDetections: {
                type: Type.ARRAY,
                description: "A list of objects, species, or phenomena detected by simulated computer vision and sonar. Keep it to 2-3 key detections.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['Species', 'Object', 'Phenomenon'], description: "The category of the detection." },
                        name: { type: Type.STRING, description: "The name of the detected item, e.g., 'Humpback Whale Pod' or 'Plastic Debris Field'." },
                        details: { type: Type.STRING, description: "A brief, important detail about the detection, e.g., 'Migrating south' or 'High density'." }
                    }
                }
            },
            environmentalAnomalies: {
                type: Type.ARRAY,
                description: "A list of significant deviations from normal environmental parameters detected by sensors. List 2-3 important anomalies.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        parameter: { type: Type.STRING, description: "The environmental parameter, e.g., 'Sea Surface Temp' or 'Salinity'." },
                        status: { type: Type.STRING, description: "The status of the anomaly, e.g., '+1.8°C above average' or '-0.5 PSU'." },
                        severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The severity level of the anomaly." }
                    }
                }
            },
            predictiveForecast: {
                type: Type.OBJECT,
                description: "An AI-powered forecast about a key ecological trend based on current data.",
                properties: {
                    topic: { type: Type.STRING, description: "The subject of the forecast, e.g., 'Coral Bleaching Risk' or 'Algal Bloom Probability'." },
                    trend: { type: Type.STRING, description: "The predicted trend, e.g., 'Elevated risk' or 'Expected to expand'." },
                    timeframe: { type: Type.STRING, description: "The timeframe for the prediction, e.g., 'Next 7-10 days'." }
                }
            }
        }
    },
    suggestions: {
      type: Type.ARRAY,
      description: "An array of 2-3 short, context-aware follow-up questions the user might be interested in.",
      items: { type: Type.STRING }
    }
  }
};

const languageMap: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    ar: 'Arabic',
    ml: 'Malayalam'
};

type UploadedFile = { name: string; type: string; data: string; };

export const getOceanInsight = async (
    query: string, 
    history: ChatMessage[], 
    language: Language,
    file?: UploadedFile,
    vectorDB?: VectorDBEntry[]
): Promise<GeminiResponse> => {
  const targetLanguage = languageMap[language] || 'English';
  
  if (vectorDB && vectorDB.length > 0) {
    // RAG mode using the in-memory vector DB
    try {
      const queryEmbedding = await generateEmbedding(query);
      const relevantChunks = findRelevantChunks(queryEmbedding, vectorDB);
      const context = relevantChunks.map(chunk => chunk.text).join('\n\n---\n\n');
      
      const prompt = `Based STRICTLY on the following context, answer the user's question. Do not use any external knowledge. If the answer is not in the context, state that the information is not available in the provided document.\n\nContext:\n${context}\n\nQuestion:\n${query}`;
      
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: `You are an assistant that answers questions based EXCLUSIVELY on the provided context. Your entire response MUST be in ${targetLanguage}.`
        }
      });

      return {
        narrative: response.text,
        visualizationType: VisType.NONE,
        visualizationData: null,
        intelligenceReport: null,
        suggestions: [],
      };
    } catch (error) {
      console.error("Error fetching from Gemini API in RAG mode:", error);
      throw new Error("Failed to get a response from the AI model based on the provided document.");
    }
  } else {
    // Original full-featured mode
    try {
      const promptParts: any[] = [];

      let promptText = `The user is communicating in ${targetLanguage}. Based on the user's query "${query}" and our previous conversation, generate a response about ocean data. The current year is 2024. Generate a realistic but simulated real-time intelligence report.`;

      if (file) {
          const base64Data = file.data.split(',')[1];
          promptParts.push({
              inlineData: {
                  mimeType: file.type,
                  data: base64Data,
              },
          });
          promptText += ` The user has attached a file named "${file.name}" of type "${file.type}". Please analyze its content and incorporate your findings into your response, relating it to oceanography where possible.`;
      }

      promptText += ` Important: Your entire response, including all text in the JSON output (narrative, titles, descriptions, intelligence reports, suggestions, etc.), MUST be in ${targetLanguage}.`;

      promptParts.unshift({ text: promptText });


      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: promptParts },
        config: {
          systemInstruction: `You are MARINOVA, a real-time AI Ocean Intelligence System. Your purpose is to collect, interpret, and visualize ocean and marine life data from simulated sensors, satellite feeds, sonar, and cameras. You can generate visualizations including maps, charts, ocean layer diagrams, and pseudo-3D models of marine life or objects. You detect, classify, and track marine species, ocean parameters, and human impacts. You use generative AI to explain findings in plain language and predict ecological trends. You MUST respond in the language specified in the prompt.`,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const text = response.text.trim();
      const parsedResponse = JSON.parse(text) as Omit<GeminiResponse, 'visualizationType'> & { visualizationType: string };
      
      const visualizationType = parsedResponse.visualizationType as VisualizationType;
      const validTypes = ['MAP', 'CHART', 'LAYERS', 'THREE_D_MODEL', 'NONE'];
      if (!validTypes.includes(visualizationType)) {
          throw new Error(`Invalid visualizationType received from AI: ${visualizationType}`);
      }

      return {
          ...parsedResponse,
          visualizationType: visualizationType,
      };

    } catch (error) {
      console.error("Error fetching from Gemini API:", error);
      throw new Error("Failed to get a response from the AI model.");
    }
  }
};

export const getTextToSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error fetching from TTS API:", error);
        throw new Error("Failed to generate speech from the AI model.");
    }
};

const reportSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise, engaging title for the report." },
        introduction: { type: Type.STRING, description: "A brief introductory paragraph summarizing the topic." },
        sections: {
            type: Type.ARRAY,
            description: "An array of 2 to 4 detailed sections, each with a heading and content.",
            items: {
                type: Type.OBJECT,
                properties: {
                    heading: { type: Type.STRING, description: "The heading for this section." },
                    content: { type: Type.STRING, description: "The detailed content for this section, written in an informative and accessible style." }
                }
            }
        },
        images: {
            type: Type.ARRAY,
            description: "An array of 2 to 3 image objects, each with a prompt for image generation and a caption.",
            items: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING, description: "A descriptive prompt to be used as a seed for generating a placeholder image. E.g., 'deep_sea_hydrothermal_vent' or 'vibrant_coral_reef_ecosystem'." },
                    caption: { type: Type.STRING, description: "A brief, descriptive caption for the image." }
                }
            }
        },
        visualization: {
            type: Type.OBJECT,
            description: "An optional data visualization (map or chart) if relevant to the query. If not relevant, this entire 'visualization' field should be null. If provided, 'type' must be either 'MAP' or 'CHART'.",
            properties: {
                type: { type: Type.STRING, enum: ['MAP', 'CHART'], description: "The type of visualization."},
                title: { type: Type.STRING, description: "A title for the visualization."},
                data: {
                    type: Type.OBJECT,
                    description: "The data for the visualization, containing either a 'map' or 'chart' object based on the 'type' field above.",
                    properties: {
                        map: {
                            type: Type.OBJECT,
                            description: "Data for an interactive map visualization. Provide this object if visualization.type is 'MAP'.",
                            properties: {
                                center: { type: Type.OBJECT, properties: { lat: {type: Type.NUMBER}, lon: {type: Type.NUMBER} }, description: "The central latitude and longitude of the map."},
                                zoom: { type: Type.NUMBER, description: "The zoom level of the map, from 1 to 10."},
                                dataType: { type: Type.STRING, description: "The type of data being shown, e.g., 'Salinity'."},
                                points: {
                                    type: Type.ARRAY,
                                    description: "An array of data points to display on the map.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            lat: { type: Type.NUMBER, description: "Latitude of the data point."},
                                            lon: { type: Type.NUMBER, description: "Longitude of the data point."},
                                            label: { type: Type.STRING, description: "A short label for the data point."},
                                            value: { type: Type.STRING, description: "The value at this point, e.g., '34.5 PSU'."}
                                        }
                                    }
                                }
                            }
                        },
                        chart: {
                            type: Type.OBJECT,
                            description: "Data for a chart visualization. Provide this object if visualization.type is 'CHART'.",
                            properties: {
                                yAxisLabel: { type: Type.STRING, description: "The label for the Y-axis, e.g., 'Temperature (°C)'."},
                                series1Name: { type: Type.STRING, description: "The name of the primary data series."},
                                series2Name: { type: Type.STRING, description: "The name of the optional secondary data series."},
                                data: {
                                    type: Type.ARRAY,
                                    description: "An array of data objects for the chart.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            label: { type: Type.STRING, description: "The label for the data point (e.g., a year or a location)." },
                                            value1: { type: Type.NUMBER, description: "The primary value for the data point (e.g., temperature)." },
                                            value2: { type: Type.NUMBER, description: "An optional second value for comparison charts." }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const getDetailedReport = async (query: string, language: Language): Promise<DetailedReport> => {
    const targetLanguage = languageMap[language] || 'English';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a detailed report about: "${query}".`,
            config: {
                systemInstruction: `You are an expert oceanographer AI named MARINOVA. Your task is to generate a comprehensive, well-structured report based on the user's query. You have access to simulated real-time data from the entire ARGO float network (https://www.argodatamgt.org/) and other oceanographic sources. Ensure the report is detailed, accurate, and engaging for a general audience. Include multiple sections, suggest relevant images, and provide a data visualization if applicable. The entire response, including all text in the JSON output, MUST be in ${targetLanguage}.`,
                responseMimeType: "application/json",
                responseSchema: reportSchema,
            }
        });

        const text = response.text.trim();
        const parsedReport = JSON.parse(text);

        return parsedReport as DetailedReport;

    } catch (error) {
        console.error("Error fetching detailed report from Gemini API:", error);
        throw new Error("Failed to generate a detailed report from the AI model.");
    }
};