import React from "react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useWebSocketStore } from "../../stores/useWebSocketStore";

const WebSocketStatus: React.FC = () => {
  const { isConnected, isConnecting, connectionError } = useWebSocketStore();

  if (isConnecting) {
    return (
      <Chip size="sm" color="warning" variant="flat">
        <Icon icon="mdi:loading" className="mr-1 animate-spin" />
        Connecting...
      </Chip>
    );
  }

  if (connectionError) {
    return (
      <Chip size="sm" color="danger" variant="flat" title={connectionError}>
        <Icon icon="mdi:wifi-off" className="mr-1" />
        Connection Error
      </Chip>
    );
  }

  return (
    <Chip size="sm" color={isConnected ? "success" : "default"} variant="flat">
      <Icon icon={isConnected ? "mdi:wifi" : "mdi:wifi-off"} className="mr-1" />
      {isConnected ? "Real-time Active" : "Offline Mode"}
    </Chip>
  );
};

export default WebSocketStatus;
