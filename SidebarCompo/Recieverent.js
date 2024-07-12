import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Recieverent = () => {
  const [rentPaidTenants, setRentPaidTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentPaidTenants = async () => {
      try {
        const response = await fetch(
          "https://stock-management-system-server-6mja.onrender.com/api/tenants/rent-received"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setRentPaidTenants(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rent received tenants:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRentPaidTenants();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.tenantItem}>
      <Image
        source={
          item.gender === "female"
            ? require("../assets/images/female.png")
            : require("../assets/images/male.png")
        }
        style={styles.image}
      />
      <View style={styles.tenantDetails}>
        <Text style={styles.tenantName}>{item.name}</Text>
        <Text style={styles.tenantRentStatus}>Rent Paid</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching data: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rentPaidTenants}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

export default Recieverent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tenantItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 80,
    borderRadius: 30,
    marginRight: 16,
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tenantRentStatus: {
    fontSize: 14,
    color: "green",
  },
});
