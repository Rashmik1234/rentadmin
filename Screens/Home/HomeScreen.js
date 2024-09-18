import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Bars3CenterLeftIcon, BellIcon } from "react-native-heroicons/solid";

const propStyle = (percent) => {
  const base_degrees = -135;
  const rotateBy = base_degrees + percent * 3.6;
  return {
    transform: [`{ rotateZ: ${rotateBy}deg }`],
  };
};

const renderThirdLayer = (percent) => {
  if (percent > 50) {
    return (
      <View
        style={[styles.secondProgressLayer, propStyle(percent - 50)]}
      ></View>
    );
  } else {
    return <View style={styles.offsetLayer}></View>;
  }
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [activeNavItem, setActiveNavItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBellSidebarOpen, setIsBellSidebarOpen] = useState(false);
  const [bellSidebarAnim] = useState(new Animated.Value(-250));
  const [tenants, setTenants] = useState([]);
  const [overdueTenants, setOverdueTenants] = useState([]);
  const sidebarAnim = useRef(new Animated.Value(-250)).current;

  const [rentPendingTenants, setRentPendingTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentPendingTenants = async () => {
      try {
        const response = await fetch(
          "https://stock-management-system-server-tmxv.onrender.com/api/tenants/rent-pending"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Log the response data to verify the structure

        // Check if data is an array or has a specific structure
        const tenantsWithPendingRent = Array.isArray(data)
          ? data.filter((tenant) => tenant.rent_status === "pending")
          : data.tenantRentPending.filter(
              (tenant) => tenant.rent_status === "pending"
            );

        setRentPendingTenants(tenantsWithPendingRent);
      } catch (error) {
        console.error("Error fetching rent pending tenants:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRentPendingTenants();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          societiesResponse,
          flatsResponse,
          flatsOnRentResponse,
          emptyFlatsResponse,
          rentReceivedResponse,
          rentPendingResponse,
        ] = await Promise.all([
          fetch(
            "https://stock-management-system-server-tmxv.onrender.com/api/societies/count"
          ),
          fetch(
            "https://stock-management-system-server-tmxv.onrender.com/api/flats/count"
          ),
          fetch(
            "https://stock-management-system-server-tmxv.onrender.com/api/flats/on-rent"
          ), //occupied
          fetch(
            "https://stock-management-system-server-tmxv.onrender.com/api/flats/vaccant"
          ), //empty
          fetch(
            "https://stock-management-system-server-tmxv.onrender.com/api/tenants/rent-received"
          ),
          fetch(
            "https://stock-management-system-server-tmxv.onrender.com/api/tenants/rent-pending"
          ),
        ]);

        const societiesData = await societiesResponse.json();
        const flatsData = await flatsResponse.json();
        const flatsOnRentData = await flatsOnRentResponse.json();

        const emptyFlatsData = await emptyFlatsResponse.json();
        const rentReceivedData = await rentReceivedResponse.json();
        const rentPendingData = await rentPendingResponse.json();

        console.log({
          societiesData,
          flatsData,
          flatsOnRentData,
          emptyFlatsData,
          rentReceivedData,
          rentPendingData,
        });

        const totalFlats = flatsData.totalFlats || 0;
        const flatsOnRent = flatsOnRentData.noOfFlatsOnRent || 0;
        const emptyFlats = emptyFlatsData.noOfVaccantFlats || 0;
        const rentPending = rentPendingData.noOfFlatsRentPending || 0;
        const rentReceived = rentReceivedData.noOfFlatsRentReceived || 0;

        setBlocks([
          {
            key: 1,
            label: "Total Buildings",
            value: societiesData.totalSocieties || 0,
            maxValue: 100,
            percent: 100,
            style: styles.block1,
            screen: "Totalbuildings",
          },
          {
            key: 2,
            label: "Total Flat",
            value: totalFlats,
            maxValue: 100,
            percent: totalFlats > 0 ? 100 : 0,
            style: styles.block2,
            screen: "Room",
          },
          {
            key: 3,
            label: "Flat On Rent",
            value: flatsOnRent,
            maxValue: 100,
            percent:
              totalFlats > 0
                ? ((flatsOnRent / totalFlats) * 100).toFixed(1)
                : 0,
            style: styles.block3,
            screen: "FlatsOnRent",
          },
          {
            key: 4,
            label: "Empty Flat",
            value: emptyFlats,
            maxValue: 100,
            percent:
              totalFlats > 0 ? ((emptyFlats / totalFlats) * 100).toFixed(1) : 0,
            style: styles.block4,
            screen: "Emptyflats",
          },
          {
            key: 5,
            label: "Pending Status",
            value: rentPending,
            maxValue: 100,
            percent:
              flatsOnRent > 0
                ? ((rentPending / flatsOnRent) * 100).toFixed(1)
                : 0,

            style: styles.block5,
            screen: "Pendingstatus",
          },
          {
            key: 6,
            label: "Month Rent Received",
            value: rentReceived,
            maxValue: 100,
            percent:
              flatsOnRent > 0
                ? ((rentReceived / flatsOnRent) * 100).toFixed(1)
                : 0,
            style: styles.block6,
            screen: "Recieverent",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const [blocks, setBlocks] = useState([]);

  const handleBlockPressIn = (blockNumber) => {
    setHoveredBlock(blockNumber);
    console.log("Block entered");
  };

  const handleBlockPressOut = () => {
    setHoveredBlock(null);
  };

  const handleSidebarItemPress = (navItem) => {
    setActiveNavItem(navItem);
    navigation.navigate(navItem);
  };

  const handleBlockPress = (screenName, screenData) => {
    navigation.navigate(screenName, { screenData });
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -250,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setIsSidebarOpen(false));
    } else {
      setIsSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -250,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setIsSidebarOpen(false));
    }
  };

  const toggleBellSidebar = () => {
    if (isBellSidebarOpen) {
      Animated.timing(bellSidebarAnim, {
        toValue: -250,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setIsBellSidebarOpen(false));
    } else {
      setIsBellSidebarOpen(true);
      Animated.timing(bellSidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeBellSidebar = () => {
    if (isBellSidebarOpen) {
      Animated.timing(bellSidebarAnim, {
        toValue: -250,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setIsBellSidebarOpen(false));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.tenantItem}>
      <Image
        source={
          item.gender === "female"
            ? require("../../assets/images/female.png")
            : require("../../assets/images/male.png")
        }
        style={styles.image}
      />
      <Text style={styles.tenantName}>{item.name}</Text>
      <Text style={styles.tenantRentStatus}>Details: {item.rent_status}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Bars3CenterLeftIcon
            color="black"
            size={30}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.heading}>Hi Akshata,</Text>
        <TouchableOpacity onPress={toggleBellSidebar}>
          <BellIcon color="black" size={30} />
        </TouchableOpacity>
      </View>

      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}>
        <View
          style={{
            alignItems: "center",
            marginTop: 40,
            backgroundColor: "black",
            padding: 10,
            width: "100%",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            MENU
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleSidebarItemPress("ManageSociety")}
          style={[
            styles.sidebarItem,
            activeNavItem === "ManageSociety" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Manage Society</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSidebarItemPress("ManageWings")}
          style={[
            styles.sidebarItem,
            activeNavItem === "ManageWings" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Manage Wings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSidebarItemPress("ManageFlats")}
          style={[
            styles.sidebarItem,
            activeNavItem === "ManageFlats" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Manage Flats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSidebarItemPress("ManageTenants")}
          style={[
            styles.sidebarItem,
            activeNavItem === "ManageTenants" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Manage Tenants</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => handleSidebarItemPress("RentStatus")}
          style={[
            styles.sidebarItem,
            activeNavItem === "RentStatus" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Rent Status</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => handleSidebarItemPress("Tenant")}
          style={[
            styles.sidebarItem,
            activeNavItem === "Tenant" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Tenant Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSidebarItemPress("Expenses")}
          style={[
            styles.sidebarItem,
            activeNavItem === "Expenses" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Update Pays</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSidebarItemPress("Report")}
          style={[
            styles.sidebarItem,
            activeNavItem === "Report" && styles.activeSidebarItem,
          ]}
        >
          <Text style={styles.sidebarText}>Flat History </Text>
        </TouchableOpacity>
      </Animated.View>
      {isBellSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeBellSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.bellSidebar, { right: bellSidebarAnim }]}>
        <View
          style={{
            alignItems: "center",
            marginTop: 40,
            backgroundColor: "black",
            padding: 10,
            width: "100%",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            Notifications
          </Text>
        </View>
        <View style={styles.container}>
          <FlatList
            data={rentPendingTenants}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
          />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.admin}>
            <Text style={styles.subheading}>
              All Properties At One Place, See Details.
            </Text>
            <Text style={styles.date}>{new Date().toDateString()}</Text>
          </View>

          {blocks.map((block) => {
            let firstProgressLayerStyle;
            if (block.percent > 50) {
              firstProgressLayerStyle = propStyle(50);
            } else {
              firstProgressLayerStyle = propStyle(block.percent);
            }

            return (
              <TouchableOpacity
                key={block.key}
                style={[
                  styles.block,
                  hoveredBlock === block.key
                    ? styles.hoveredBlock
                    : block.style,
                ]}
                onPress={() => handleBlockPress(block.screen, block.screenData)}
                onPressIn={() => handleBlockPressIn(block.key)}
                onPressOut={handleBlockPressOut}
              >
                <View style={styles.spinnerContainer}>
                  <View style={styles.cont}>
                    <View
                      style={[
                        styles.firstProgressLayer,
                        firstProgressLayerStyle,
                      ]}
                    ></View>
                    {renderThirdLayer(block.percent)}
                    <Text style={styles.display}>{block.percent}%</Text>
                  </View>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.textl}>{block.label}</Text>
                  <Text style={styles.textv}>{block.value}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  tenantItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  image: {
    width: 60,
    height: 80,
    borderRadius: 30,
    marginRight: 16,
  },
  tenantDetails: {
    fontSize: 14,
  },
  content: {
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "flex-start",
    gap: 15,
    marginBottom: 40,
  },
  textl: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  textv: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  addtext: {
    fontSize: 25,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: 0,
    alignItems: "center",
  },
  block: {
    height: 170,
    width: "90%",
    backgroundColor: "#7F00FF",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 35,
    elevation: 20,
    shadowOpacity: 1.3,
    shadowRadius: 2,
  },
  block1: {
    backgroundColor: "#CCCCFF",
  },
  block2: {
    backgroundColor: "#ade6d8",
  },
  block3: {
    backgroundColor: "#ADD8E6",
  },
  block4: {
    backgroundColor: "#FBCEB1",
  },
  block5: {
    backgroundColor: "#e6d8ad",
  },
  block6: {
    backgroundColor: "#FFC0CB",
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 2,
    alignItems: "flex-end",
    color: "white",
  },
  cont: {
    width: 100,
    height: 100,
    borderWidth: 10,
    borderRadius: 60,
    borderColor: "#FAF9F6",
    justifyContent: "center",
    alignItems: "center",
    borderLeftColor: "white",
    borderBottomColor: "white",
    borderRightColor: "#3498db",
    borderTopColor: "#3498db",
  },

  bellSidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#f8f8f8",
    zIndex: 100,
  },
  offsetLayer: {
    width: 200,
    height: 200,
    position: "absolute",
    borderWidth: 20,
    borderRadius: 100,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "white",
    borderTopColor: "blue",
    transform: [{ rotateZ: "-135deg" }],
  },
  display: {
    position: "absolute",
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#ffffff",
    padding: 20,
    zIndex: 10,
    elevation: 10,
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  tenantRentStatus: {
    fontSize: 14,
    color: "red",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },
  bellSidebarText: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sidebarItem: {
    padding: 7,
    marginVertical: 5,
    borderRadius: 20,
    justifyContent: "center",
  },
  activeSidebarItem: {
    backgroundColor: "#ADD8E6",
  },
  sidebarText: {
    fontSize: 16,
    marginVertical: 15,
  },
  hoveredBlock: {
    backgroundColor: "#FFA07A",
  },
});