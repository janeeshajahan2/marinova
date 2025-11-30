import React from 'react';
import type { ChatMessage, VisualizationData } from '../types';
import { ChatInterface } from './ChatInterface';
import { VisualizationPanel } from './VisualizationPanel';

interface ChatPageProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, file?: { name: string; type: string; data: string; }) => void;
  isLoading: boolean;
  error: string | null;
  visualization: VisualizationData | null;
}

export const ChatPage: React.FC<ChatPageProps> = (props) => {
  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4">
      <div className="h-1/2 lg:h-full lg:w-1/2 flex-grow">
        <ChatInterface
          messages={props.messages}
          onSendMessage={props.onSendMessage}
          isLoading={props.isLoading}
          error={props.error}
        />
      </div>
      <div className="h-1/2 lg:h-full lg:w-1/2 flex-grow">
         <VisualizationPanel 
            visualization={props.visualization} 
            isLoading={props.isLoading} 
        />
      </div>
    </div>
  );
};