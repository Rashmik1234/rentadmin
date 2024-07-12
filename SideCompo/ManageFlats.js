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

const ManageFlats = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedWing, setSelectedWing] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [wingsBySociety, setWingsBySociety] = useState({});
  const [flatsByWing, setFlatsByWing] = useState({});
  const [wingName, setWingName] = useState("");
  const [flatName, setFlatName] = useState("");
  const [fetchError, setFetchError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingWings, setLoadingWings] = useState(false);
  const [loadingFlats, setLoadingFlats] = useState(false);

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
        setFetchError(null);
        fetchWingsForAllSocieties(data);
      })
      .catch((error) => {
        console.error("Error fetching societies:", error);
        setFetchError(error.message);
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
        .then((data) => {
          return { societyId: society._id, wings: data };
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
        results.forEach(({ wings }) => fetchFlatsForAllWings(wings));
      })
      .catch((error) => {
        console.error("Error fetching wings:", error);
        setLoadingWings(false);
      });
  };

  const fetchFlatsForAllWings = (wings) => {
    setLoadingFlats(true);
    const fetchPromises = wings.map((wing) =>
      fetch(
        `https://stock-management-system-server-6mja.onrender.com/api/flats/flats-by-wings/${wing._id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          return { wingId: wing._id, flats: data };
        })
    );

    Promise.all(fetchPromises)
      .then((results) => {
        // const flatsByWing = {};
        results.forEach(({ wingId, flats }) => {
          flatsByWing[wingId] = flats;
        });
        setFlatsByWing(flatsByWing);
        setLoadingFlats(false);
      })
      .catch((error) => {
        console.error("Error fetching flats:", error);
        setLoadingFlats(false);
      });
  };

  const addFlat = () => {
    fetch(
      `https://stock-management-system-server-6mja.onrender.com/api/flats/add-flats-by-wing/${selectedWing._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: flatName, flat_status: "vaccant" }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add flat");
        }
        return response.json();
      })
      .then((data) => {
        fetchFlatsForWing(selectedWing._id);
        setIsModalVisible(false);
        setFlatName("");
      })
      .catch((error) => {
        console.error("Error adding flat:", error);
      });
  };

  const fetchFlatsForWing = (wingId) => {
    fetch(
      `https://stock-management-system-server-6mja.onrender.com/api/flats/flats-by-wings/${wingId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setFlatsByWing((prev) => ({ ...prev, [wingId]: data }));
      })
      .catch((error) => {
        console.error("Error fetching flats for wing:", error);
      });
  };

  const editFlat = (flatId, wingId) => {
    const flatToEdit = flatsByWing[wingId]?.find((flat) => flat._id === flatId);
    if (!flatToEdit) {
      console.error("Flat to edit not found");
      return;
    }
    setSelectedFlat({ flatId, wingId });
    setFlatName(flatToEdit.name);
    setEditModalVisible(true);
  };

  const updateFlat = () => {
    if (!selectedFlat || !selectedFlat.flatId || !selectedFlat.wingId) {
      console.error("Invalid selected flat or wing ID");
      return;
    }

    fetch(
      `https://stock-management-system-server-6mja.onrender.com/api/flats/${selectedFlat.flatId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: flatName }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update flat");
        }
        return response.json();
      })
      .then((updatedFlat) => {
        const updatedFlats = flatsByWing[selectedFlat.wingId].map((flat) =>
          flat._id === selectedFlat.flatId ? updatedFlat : flat
        );
        setFlatsByWing((prev) => ({
          ...prev,
          [selectedFlat.wingId]: updatedFlats,
        }));
        setEditModalVisible(false);
        setFlatName("");
        setSelectedFlat(null);
      })
      .catch((error) => {
        console.error("Error updating flat:", error);
      });
  };

  const deleteFlat = (flatId, wingId) => {
    setSelectedFlat({ flatId, wingId });
    setDeleteModalVisible(true);
  };

  const confirmDeleteFlat = () => {
    if (!selectedFlat || !selectedFlat.flatId || !selectedFlat.wingId) {
      console.error("Invalid selected flat or wing ID");
      return;
    }

    fetch(
      `https://stock-management-system-server-6mja.onrender.com/api/flats/${selectedFlat.flatId}`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete flat");
        }
        return response.json();
      })
      .then(() => {
        const updatedFlats = flatsByWing[selectedFlat.wingId].filter(
          (flat) => flat._id !== selectedFlat.flatId
        );
        setFlatsByWing((prev) => ({
          ...prev,
          [selectedFlat.wingId]: updatedFlats,
        }));
        setDeleteModalVisible(false);
        setSelectedFlat(null);
      })
      .catch((error) => {
        console.error("Error deleting flat:", error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Manage Flats</Text>

      {fetchError && (
        <Text style={styles.errorText}>Error fetching data: {fetchError}</Text>
      )}

      <ScrollView contentContainerStyle={styles.scrollView}>
        {societies.map((society) => (
          <View key={society._id} style={styles.societyContainer}>
            <View style={styles.societyHeader}>
              <Image
                source={{ uri: society.societyImage }}
                style={styles.societyImage}
              />
              <Text style={styles.societyName}>{society.name}</Text>
            </View>

            {loadingWings ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              (wingsBySociety[society._id] || []).map((wing) => (
                <View key={wing._id} style={styles.wingContainer}>
                  <Text style={styles.wingName}>{wing.name}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedWing(wing);
                      setIsModalVisible(true);
                    }}
                  >
                    <FontAwesome name="plus" size={20} color="green" />
                    <Text style={styles.addButtonText}>Add Flat</Text>
                  </TouchableOpacity>

                  {loadingFlats ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : (
                    (flatsByWing[wing._id] || []).map((flat) => (
                      <View key={flat._id} style={styles.flatContainer}>
                        <Text style={styles.flatName}>{flat.name}</Text>
                        <TouchableOpacity
                          onPress={() => editFlat(flat._id, wing._id)}
                          style={styles.editButton}
                        >
                          <FontAwesome name="edit" size={20} color="blue" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteFlat(flat._id, wing._id)}
                          style={styles.deleteButton}
                        >
                          <FontAwesome name="trash" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Flat</Text>
            <TextInput
              style={styles.input}
              placeholder="Flat Name"
              value={flatName}
              onChangeText={setFlatName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addFlat}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Flat</Text>
            <TextInput
              style={styles.input}
              placeholder="Flat Name"
              value={flatName}
              onChangeText={setFlatName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={updateFlat}>
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Flat</Text>
            <Text>Are you sure you want to delete this flat?</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDeleteFlat}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollView: {
    paddingBottom: 16,
  },
  societyContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#fff",
  },
  societyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  societyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  societyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  wingContainer: {
    marginBottom: 16,
    paddingLeft: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  wingName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#444",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addButtonText: {
    marginLeft: 8,
    color: "green",
    fontWeight: "bold",
  },
  flatContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 16,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  flatName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  editButton: {
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333", // Darker text color
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333", // Darker text color
  },
  saveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ManageFlats;
