import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MaathaCare Info</Text>
      <View style={styles.separator} />

      <Text style={styles.content}>
        This is a secure area for MaathaCare users. Please contact your PHM if
        you have any questions.
      </Text>

      <Link href="/(tabs)" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go back to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF69B4", // MaathaCare Pink
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
    backgroundColor: "#eee",
  },
  content: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
