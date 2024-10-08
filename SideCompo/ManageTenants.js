import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ManageTenants = ({ navigation }) => {
  const [tenantsByFlat, setTenantsByFlat] = useState({});
  const [societies, setSocieties] = useState([]);
  const [wingsBySociety, setWingsBySociety] = useState({});
  const [loadingWings, setLoadingWings] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = () => {
    fetch(
      "https://stock-management-system-server-6mja.onrender.com/api/societies"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setSocieties(data);
        fetchWingsForAllSocieties(data);
      })
      .catch((error) => {
        console.error("Error fetching societies:", error);
        setFetchError(error.message);
      });
  };

  const fetchTenantsForFlat = (flatId) => {
    if (tenantsByFlat[flatId]) return;

    fetch(
      `https://stock-management-system-server-6mja.onrender.com/api/tenants/tenants-by-flat/${flatId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setTenantsByFlat((prev) => ({ ...prev, [flatId]: data || [] }));
      })
      .catch((error) => {
        console.error("Error fetching tenants:", error.message);
      });
  };

  const fetchWingsForAllSocieties = (societies) => {
    setLoadingWings(true);
    const fetchPromises = societies.map((society) =>
      fetch(
        `https://stock-management-system-server-6mja.onrender.com/api/wings/wings-by-society/${society._id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((wings) => {
          const wingPromises = wings.map((wing) =>
            fetch(
              `https://stock-management-system-server-6mja.onrender.com/api/flats/flats-by-wings/${wing._id}`
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.json();
              })
              .then((flats) => {
                wing.flats = flats;
                return wing;
              })
          );
          return Promise.all(wingPromises).then((wingsWithFlats) => {
            return { societyId: society._id, wings: wingsWithFlats };
          });
        })
    );

    Promise.all(fetchPromises)
      .then((results) => {
        const wingsBySociety = {};
        results.forEach(({ societyId, wings }) => {
          wingsBySociety[societyId] = wings;
        });
        setWingsBySociety(wingsBySociety);
        setLoadingWings(false);
      })
      .catch((error) => {
        console.error("Error fetching wings:", error);
        setLoadingWings(false);
      });
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setEditModalVisible(true);
  };

  const handleDeleteTenant = (tenant) => {
    setSelectedTenant(tenant);
    setDeleteModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {fetchError && (
        <Text style={styles.errorText}>Error fetching data: {fetchError}</Text>
      )}

      <ScrollView contentContainerStyle={styles.scrollView}>
        {societies.map((society) => (
          <View key={society._id} style={styles.societyContainer}>
            <Text style={styles.societyName}>{society.name}</Text>
            {loadingWings ? (
              <ActivityIndicator size="large" color="#6699CC" />
            ) : (
              wingsBySociety[society._id]?.map((wing) => (
                <View key={wing._id} style={styles.flatListingContainer}>
                  {wing.flats && wing.flats.length > 0 ? (
                    wing.flats.map((flat) => {
                      fetchTenantsForFlat(flat._id);
                      return (
                        <View key={flat._id} style={styles.flatContainer}>
                          <Text style={styles.flatName}>
                            {society.name}/{wing.name}/{flat.name}
                          </Text>
                          <View style={styles.tenantListingContainer}>
                            {tenantsByFlat[flat._id] &&
                            Array.isArray(tenantsByFlat[flat._id]) ? (
                              tenantsByFlat[flat._id].map((tenant) => (
                                <View
                                  key={tenant._id}
                                  style={styles.tenantContainer}
                                >
                                  <View style={styles.tenant}>
                                    <Image
                                      source={
                                        tenant.gender === "female"
                                          ? require("../assets/images/female.png")
                                          : require("../assets/images/male.png")
                                      }
                                      style={styles.image}
                                    />
                                    <Text style={styles.tenantName}>
                                      {tenant.name}
                                    </Text>
                                  </View>
                                  <View style={styles.tenantListRight}>
                                    <Text>{flat.flat_type}</Text>

                                    <View style={styles.flatIcons}>
                                      <TouchableOpacity
                                        onPress={() => handleEditTenant(tenant)}
                                      >
                                        <FontAwesome
                                          name="edit"
                                          size={30}
                                          color="#6699CC"
                                        />
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          handleDeleteTenant(tenant)
                                        }
                                      >
                                        <FontAwesome
                                          name="trash"
                                          size={30}
                                          color="red"
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              ))
                            ) : (
                              <Text>No tenants found</Text>
                            )}
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text>No flats for this Wing</Text>
                  )}
                  
                </View>
              ))
            )}
            <View style={styles.divider} />
          </View>
        ))}
      </ScrollView>

      {/* Edit Tenant Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Edit Tenant</Text>
            <TextInput
              value={selectedTenant?.name}
              onChangeText={(text) =>
                setSelectedTenant((prev) => ({ ...prev, name: text }))
              }
              placeholder="Tenant Name"
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => {
                setEditModalVisible(false);
              }}
            >
              <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Tenant Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Are you sure you want to delete this tenant?</Text>
            <TouchableOpacity
              onPress={() => {
                // Delete tenant logic here
                setDeleteModalVisible(false);
              }}
            >
              <Text>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
              <Text>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor:"#fff",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    paddingVertical: 10,
  },
  societyContainer: {
    marginBottom: 20,
  },
   divider: {
    height: 1,
    backgroundColor: "#DDD",
    marginVertical: 10,
  },
  societyName: {
    fontSize: 18,
    fontWeight: "bold",
   
  },
  flatListingContainer: {
    marginBottom: 10,
  },
  flatsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  flatContainer: {
    marginRight: 10,
    marginBottom: 10,
    width: "100%",
  },
  flatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tenantListingContainer: {
    marginTop: 10,
  },
  tenantContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  tenant: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tenantName: {
    fontSize: 16,
    color: "#009E60",
    fontWeight: "700",
  },
  image: {
    width: 50,
    height: 70,
    borderRadius: 15,
    marginRight: 10,
  },
  tenantListRight: {
    flexDirection: "row",
    gap: 10,
  },
  flatIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  errorText: {
    color: "red",
  },
});

export default ManageTenants;
