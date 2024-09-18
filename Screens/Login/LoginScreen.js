import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Alert } from 'react-native';
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    console.log(username , password)
   
    const userData={
      username:username,
      password,
    }
    try {
      // Send a POST request to the server with user data
      const response = await axios.post("https://stock-management-system-server-tmxv.onrender.com/api/login/main", userData);

      console.log(response.data); // For debugging: Show the response in the console

      if (response.data.success) {
        // If login is successful, navigate to the Home screen
        navigation.navigate("Home");
      } else {
        // If login fails, show an alert with the error message
        Alert.alert("Login Failed", response.data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Login Error", "An error occurred during login. Please try again.");
    }
    // navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.nativeEvent.text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChange={e => setPassword(e.nativeEvent.text)}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#1e90ff",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;