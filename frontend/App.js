import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const API_BASE_URL = "http://localhost:5000";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Ola! Sou seu assistente inicial de saude. Em que posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: data.error || "Erro ao processar mensagem." },
        ]);
        return;
      }

      if (data.session_id) setSessionId(data.session_id);

      const replies = Array.isArray(data.responses) ? data.responses : [];
      if (!replies.length) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Sem resposta do assistente." },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        ...replies.map((reply) => ({ from: "bot", text: reply })),
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Falha de conexao com o backend. Verifique API_BASE_URL.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Assistente de Saude</Text>
      </View>

      <ScrollView style={styles.chat} contentContainerStyle={styles.chatContent}>
        {messages.map((msg, idx) => (
          <View
            key={`${msg.from}-${idx}`}
            style={[
              styles.bubble,
              msg.from === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem"
          value={input}
          onChangeText={setInput}
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>{loading ? "..." : "Enviar"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dde1e6",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#161616",
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 10,
  },
  bubble: {
    maxWidth: "82%",
    padding: 10,
    borderRadius: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0f62fe",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dde1e6",
  },
  bubbleText: {
    color: "#161616",
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#dde1e6",
    backgroundColor: "#ffffff",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#c1c7cd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#0f62fe",
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
