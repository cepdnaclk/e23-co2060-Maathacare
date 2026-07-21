import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { API_BASE_URL } from "../constants/apiConfig";

const districtMap: Record<string, { label: string; value: string }[]> = {
  Central: [
    { label: "Kandy", value: "Kandy" },
    { label: "Matale", value: "Matale" },
    { label: "Nuwara Eliya", value: "Nuwara Eliya" },
  ],
  Eastern: [
    { label: "Ampara", value: "Ampara" },
    { label: "Batticaloa", value: "Batticaloa" },
    { label: "Trincomalee", value: "Trincomalee" },
  ],
  "North Central": [
    { label: "Anuradhapura", value: "Anuradhapura" },
    { label: "Polonnaruwa", value: "Polonnaruwa" },
  ],
  Northern: [
    { label: "Jaffna", value: "Jaffna" },
    { label: "Kilinochchi", value: "Kilinochchi" },
    { label: "Mannar", value: "Mannar" },
    { label: "Mullaitivu", value: "Mullaitivu" },
    { label: "Vavuniya", value: "Vavuniya" },
  ],
  "North Western": [
    { label: "Kurunegala", value: "Kurunegala" },
    { label: "Puttalam", value: "Puttalam" },
  ],
  Sabaragamuwa: [
    { label: "Kegalle", value: "Kegalle" },
    { label: "Ratnapura", value: "Ratnapura" },
  ],
  Southern: [
    { label: "Galle", value: "Galle" },
    { label: "Hambantota", value: "Hambantota" },
    { label: "Matara", value: "Matara" },
  ],
  Uva: [
    { label: "Badulla", value: "Badulla" },
    { label: "Monaragala", value: "Monaragala" },
  ],
  Western: [
    { label: "Colombo", value: "Colombo" },
    { label: "Gampaha", value: "Gampaha" },
    { label: "Kalutara", value: "Kalutara" },
  ],
};

const mohAreaMap: Record<string, { label: string; value: string }[]> = {
  Colombo: [
    { label: "Boralesgamuwa", value: "Boralesgamuwa" },
    { label: "Colombo MC", value: "Colombo MC" },
    { label: "Dehiwala", value: "Dehiwala" },
    { label: "Hanwella", value: "Hanwella" },
    { label: "Homagama", value: "Homagama" },
    { label: "Kaduwela", value: "Kaduwela" },
    { label: "Kolonnawa", value: "Kolonnawa" },
    { label: "Maharama", value: "Maharagama" },
    { label: "Moratuwa", value: "Moratuwa" },
    { label: "Padukka", value: "Padukka" },
    { label: "Piliyandala", value: "Piliyandala" },
    { label: "Ratmalana", value: "Ratmalana" },
  ],
  Gampaha: [
    { label: "Attanagalla", value: "Attanagalla" },
    { label: "Biyagama", value: "Biyagama" },
    { label: "Divulapitiya", value: "Divulapitiya" },
    { label: "Dompe", value: "Dompe" },
    { label: "Gampaha", value: "Gampaha" },
    { label: "Ja-Ela", value: "Ja-Ela" },
    { label: "Katana", value: "Katana" },
    { label: "Kelaniya", value: "Kelaniya" },
    { label: "Mahara", value: "Mahara" },
    { label: "Minuwangoda", value: "Minuwangoda" },
    { label: "Mirigama", value: "Mirigama" },
    { label: "Negombo", value: "Negombo" },
    { label: "Ragama", value: "Ragama" },
    { label: "Seeduwa", value: "Seeduwa" },
    { label: "Wattala", value: "Wattala" },
  ],
  Kalutara: [
    { label: "Agalawatta", value: "Agalawatta" },
    { label: "Bandaragama", value: "Bandaragama" },
    { label: "Beruwala", value: "Beruwala" },
    { label: "Bulathsinhala", value: "Bulathsinhala" },
    { label: "Dodangoda", value: "Dodangoda" },
    { label: "Horana", value: "Horana" },
    { label: "Kalutara", value: "Kalutara" },
    { label: "Madurawala", value: "Madurawala" },
    { label: "Matugama", value: "Matugama" },
    { label: "Millaniya", value: "Millaniya" },
    { label: "Palindanuwara", value: "Palindanuwara" },
    { label: "Panadura", value: "Panadura" },
    { label: "Walallawita", value: "Walallawita" },
  ],
  Matara: [
    { label: "Akuressa", value: "Akuressa" },
    { label: "Athuraliya", value: "Athuraliya" },
    { label: "Devinuwara", value: "Devinuwara" },
    { label: "Dickwella", value: "Dickwella" },
    { label: "Hakmana", value: "Hakmana" },
    { label: "Kamburupitiya", value: "Kamburupitiya" },
    { label: "Kirinda Puhulwella", value: "Kirinda Puhulwella" },
    { label: "Kotapola", value: "Kotapola" },
    { label: "Malimbada", value: "Malimbada" },
    { label: "Matara MC", value: "Matara MC" },
    { label: "Matara PS", value: "Matara PS" },
    { label: "Morawaka", value: "Morawaka" },
    { label: "Mulatiyana", value: "Mulatiyana" },
    { label: "Pasgoda", value: "Pasgoda" },
    { label: "Pitabeddara", value: "Pitabeddara" },
    { label: "Thihagoda", value: "Thihagoda" },
    { label: "Weligama", value: "Weligama" },
    { label: "Welipitiya", value: "Welipitiya" },
  ],
  Galle: [
    { label: "Akmeemana", value: "Akmeemana" },
    { label: "Ambalangoda", value: "Ambalangoda" },
    { label: "Baddegama", value: "Baddegama" },
    { label: "Balapitiya", value: "Balapitiya" },
    { label: "Bope Poddala", value: "Bope Poddala" },
    { label: "Elpitiya", value: "Elpitiya" },
    { label: "Galle MC", value: "Galle MC" },
    { label: "Gonapinuwala", value: "Gonapinuwala" },
    { label: "Habaraduwa", value: "Habaraduwa" },
    { label: "Hikkaduwa", value: "Hikkaduwa" },
    { label: "Imaduwa", value: "Imaduwa" },
    { label: "Karandeniya", value: "Karandeniya" },
    { label: "Neluwa", value: "Neluwa" },
    { label: "Niyagama", value: "Niyagama" },
    { label: "Rathgama", value: "Rathgama" },
    { label: "Thawalama", value: "Thawalama" },
    { label: "Udugama", value: "Udugama" },
    { label: "Welivitiya Divithura", value: "Welivitiya Divithura" },
    { label: "Yakkalamulla", value: "Yakkalamulla" },
  ],
  Hambantota: [
    { label: "Ambalantota", value: "Ambalantota" },
    { label: "Angunakolapelessa", value: "Angunakolapelessa" },
    { label: "Beliatta", value: "Beliatta" },
    { label: "Hambantota", value: "Hambantota" },
    { label: "Katuwana", value: "Katuwana" },
    { label: "Lunugamvehera", value: "Lunugamvehera" },
    { label: "Okewela", value: "Okewela" },
    { label: "Sooriyawewa", value: "Sooriyawewa" },
    { label: "Tangalle", value: "Tangalle" },
    { label: "Tissamaharama", value: "Tissamaharama" },
    { label: "Walasmulla", value: "Walasmulla" },
    { label: "Weeraketiya", value: "Weeraketiya" },
  ],
  Kandy: [
    { label: "Akurana", value: "Akurana" },
    { label: "Bambaradeniya", value: "Bambaradeniya" },
    { label: "Deltota", value: "Deltota" },
    { label: "Doluwa", value: "Doluwa" },
    { label: "Galagedara", value: "Galagedara" },
    { label: "Galaha", value: "Galaha" },
    { label: "Gampola (Udapalatha)", value: "Gampola (Udapalatha)" },
    { label: "Ganga Ihala Korale", value: "Ganga Ihala Korale" },
    {
      label: "Gangawata Korale",
      value: "Kandy Four Gravets & Gangawata Korale",
    },
    { label: "Harispattuwa", value: "Harispattuwa" },
    { label: "Hasalaka", value: "Hasalaka" },
    { label: "Hatharaliyadda", value: "Hatharaliyadda" },
    { label: "Kadugannawa", value: "Kadugannawa" },
    { label: "Kandy MC", value: "Kandy MC" },
    { label: "Kundasale", value: "Kundasale" },
    { label: "Manikhinna", value: "Manikhinna" },
    { label: "Medadumbara", value: "Medadumbara" },
    { label: "Pasbage Korale", value: "Pasbage Korale" },
    { label: "Panvila", value: "Panvila" },
    { label: "Pathadumbara", value: "Pathadumbara" },
    { label: "Poojapitiya", value: "Poojapitiya" },
    { label: "Thalathuoya", value: "Thalathuoya" },
    { label: "Udadumbara", value: "Udadumbara" },
    { label: "Udunuwara", value: "Udunuwara" },
    { label: "Yatinuwara", value: "Yatinuwara" },
  ],
  Matale: [],
  "Nuwara Eliya": [
    { label: "Ambagamuwa", value: "Ambagamuwa" },
    { label: "Bogawanthalawa", value: "Bogawanthalawa" },
    { label: "Ginigathhena", value: "Ginigathhena" },
    { label: "Hanguranketha", value: "Hanguranketha" },
    { label: "Kotagala", value: "Kotagala" },
    { label: "Kothmale", value: "Kothmale" },
    { label: "Lindula", value: "Lindula" },
    { label: "Maskeliya", value: "Maskeliya" },
    { label: "Mathurata", value: "Mathurata" },
    { label: "MC Nuwaraeliya", value: "MC Nuwaraeliya" },
    { label: "Nawathispane", value: "Nawathispane" },
    { label: "Nuwaraeliya", value: "Nuwaraeliya" },
    { label: "Ragala", value: "Ragala" },
    { label: "Walapane", value: "Walapane" },
  ],
  Ampara: [
    { label: "Akkaraipattu", value: "Akkaraipattu" },
    { label: "Ampara", value: "Ampara" },
    { label: "Dehiattakandiya", value: "Dehiattakandiya" },
    { label: "Mahaoya", value: "Mahaoya" },
    { label: "Padiyathalawa", value: "Padiyathalawa" },
    { label: "Uhana", value: "Uhana" },
  ],
  Batticaloa: [
    { label: "Arayampathy", value: "Arayampathy" },
    { label: "Batticaloa", value: "Batticaloa" },
    { label: "Chenkaladi", value: "Chenkaladi" },
    { label: "Eravur", value: "Eravur" },
    { label: "Kaluwanchikudy", value: "Kaluwanchikudy" },
    { label: "Kattankudy", value: "Kattankudy" },
    { label: "Kiran", value: "Kiran" },
    { label: "Oddamavady", value: "Oddamavady" },
    { label: "Paddipalai", value: "Paddipalai" },
    { label: "Valaichenai", value: "Valaichenai" },
    { label: "Vellavely", value: "Vellavely" },
  ],
  Trincomalee: [
    { label: "Eachchilampatru", value: "Eachchilampatru" },
    { label: "Gomarankadawela", value: "Gomarankadawela" },
    { label: "Kanthale", value: "Kanthale" },
    { label: "Kinniya", value: "Kinniya" },
    { label: "Kuchchaveli", value: "Kuchchaveli" },
    { label: "Kurinchakkerny", value: "Kurinchakkerny" },
  ],
  Anuradhapura: [
    { label: "Anuradhapura", value: "Anuradhapura" },
    { label: "Galenbindunuwewa", value: "Galenbindunuwewa" },
    { label: "Galnewa", value: "Galnewa" },
  ],
  Polonnaruwa: [
    { label: "Dimbulagala", value: "Dimbulagala" },
    { label: "Elahera", value: "Elahera" },
    { label: "Hingurakgoda", value: "Hingurakgoda" },
    { label: "Lankapura", value: "Lankapura" },
    { label: "Medirigiriya", value: "Medirigiriya" },
    { label: "Thamankduwa", value: "Thamankduwa" },
    { label: "Welikanda", value: "Welikanda" },
  ],
  Jaffna: [
    { label: "Chankanai", value: "Chankanai" },
    { label: "Chavakachcheri", value: "Chavakachcheri" },
    { label: "Jaffna MC", value: "Jaffna MC" },
    { label: "Kopay", value: "Kopay" },
    { label: "Karainagar", value: "Karainagar" },
    { label: "Karaveddy", value: "Karaveddy" },
    { label: "Kayts", value: "Kayts" },
    { label: "Nallur", value: "Nallur" },
    { label: "Point Pedro", value: "Point Pedro" },
    { label: "Sandilipay", value: "Sandilipay" },
    { label: "Tellippalai", value: "Tellippalai" },
    { label: "Uduvil", value: "Uduvil" },
  ],
  Kilinochchi: [
    { label: "Kandawalai", value: "Kandawalai" },
    { label: "Karachchi", value: "Karachchi" },
    { label: "Palai", value: "Palai" },
    { label: "Poonakary", value: "Poonakary" },
  ],
  Mannar: [
    { label: "Mannar Town", value: "Mannar Town" },
    { label: "Musalai", value: "Musalai" },
    { label: "Nanattan", value: "Nanattan" },
  ],
  Mullaitivu: [
    { label: "Mallavi", value: "Mallavi" },
    { label: "Mullaitivu", value: "Mullaitivu" },
  ],
  Vavuniya: [
    { label: "Cheddikulam", value: "Cheddikulam" },
    { label: "Vavuniya", value: "Vavuniya" },
    { label: "Vavuniya South", value: "Vavuniya South" },
  ],
  Kurunegala: [
    { label: "Alawwa", value: "Alawwa" },
    { label: "Galgamuwa", value: "Galgamuwa" },
    { label: "Giribawa", value: "Giribawa" },
    { label: "Kurunegala", value: "Kurunegala" },
    { label: "Maho", value: "Maho" },
    { label: "Narammala", value: "Narammala" },
    { label: "Polpithigama", value: "Polpithigama" },
    { label: "Rideegama", value: "Rideegama" },
    { label: "Udubeddawa", value: "Udubeddawa" },
  ],
  Puttalam: [
    { label: "Anamaduwa", value: "Anamaduwa" },
    { label: "Arachchikattuwa", value: "Arachchikattuwa" },
    { label: "Chilaw", value: "Chilaw" },
    { label: "Dankotuwa", value: "Dankotuwa" },
    { label: "Karuwalagaswewa", value: "Karuwalagaswewa" },
    { label: "Madampe", value: "Madampe" },
    { label: "Marawila", value: "Marawila" },
    { label: "Mundal", value: "Mundal" },
    { label: "Nattandiya", value: "Nattandiya" },
    { label: "Pallama", value: "Pallama" },
    { label: "Wennappuwa", value: "Wennappuwa" },
  ],
  Kegalle: [
    { label: "Aranayake", value: "Aranayake" },
    { label: "Kegalle", value: "Kegalle" },
    { label: "Mawanella", value: "Mawanella" },
    { label: "Rambukkana", value: "Rambukkana" },
    { label: "Ruwanwella", value: "Ruwanwella" },
    { label: "Warakapola", value: "Warakapola" },
    { label: "Yatiyantota", value: "Yatiyantota" },
  ],
  Ratnapura: [
    { label: "Balangoda", value: "Balangoda" },
    { label: "Eheliyagoda", value: "Eheliyagoda" },
    { label: "Embilipitiya", value: "Embilipitiya" },
    { label: "Ratnapura", value: "Ratnapura" },
  ],
  Badulla: [
    { label: "Badulla", value: "Badulla" },
    { label: "Bandarawela", value: "Bandarawela" },
    { label: "Diyatalawa", value: "Diyatalawa" },
    { label: "Ella", value: "Ella" },
    { label: "Haldummulla", value: "Haldummulla" },
    { label: "Hali Ela", value: "Hali Ela" },
    { label: "Haputale", value: "Haputale" },
    { label: "Kandaketiya", value: "Kandaketiya" },
    { label: "Lunugala", value: "Lunugala" },
    { label: "Mahiyanganaya", value: "Mahiyanganaya" },
    { label: "Meegahakivula", value: "Meegahakivula" },
    { label: "Passara", value: "Passara" },
    { label: "Rideemaliyadda", value: "Rideemaliyadda" },
    { label: "Soranathota", value: "Soranathota" },
    { label: "Uva Paranagama", value: "Uva Paranagama" },
    { label: "Welimada", value: "Welimada" },
  ],
  Monaragala: [
    { label: "Badalkumbura", value: "Badalkumbura" },
    { label: "Bibile", value: "Bibile" },
    { label: "Buttala", value: "Buttala" },
    { label: "Katharagama", value: "Katharagama" },
    { label: "Madulla", value: "Madulla" },
    { label: "Medagama", value: "Medagama" },
    { label: "Monaragala", value: "Monaragala" },
    { label: "Sevanagala", value: "Sevanagala" },
    { label: "Siyambalanduwa", value: "Siyambalanduwa" },
    { label: "Thanamalwila", value: "Thanamalwila" },
    { label: "Wellawaya", value: "Wellawaya" },
  ],
};

const gnDivisionMap: Record<string, { label: string; value: string }[]> = {
  "Colombo MC": [
    { label: "Borella North", value: "Borella North" },
    { label: "Borella South", value: "Borella South" },
    { label: "Cinnamon Gardens", value: "Cinnamon Gardens" },
    { label: "Dematagoda", value: "Dematagoda" },
  ],
  Homagama: [
    { label: "Homagama Town", value: "Homagama Town" },
    { label: "Pitipana", value: "Pitipana" },
    { label: "Katuwana", value: "Katuwana" },
  ],
  Default: [
    { label: "GN Division 1", value: "GN 1" },
    { label: "GN Division 2", value: "GN 2" },
  ],
};

export default function Register() {
  const router = useRouter();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");

  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [lmp, setLmp] = useState(new Date());
  const [showLmpPicker, setShowLmpPicker] = useState(false);

  const [bloodGroupOpen, setBloodGroupOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [bloodGroupItems, setBloodGroupItems] = useState([
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
  ]);

  const [provinceOpen, setProvinceOpen] = useState(false);
  const [province, setProvince] = useState<string | null>(null);
  const [provinceItems, setProvinceItems] = useState(
    Object.keys(districtMap).map((prov) => ({ label: prov, value: prov })),
  );

  const [districtOpen, setDistrictOpen] = useState(false);
  const [district, setDistrict] = useState<string | null>(null);
  const [districtItems, setDistrictItems] = useState<
    { label: string; value: string }[]
  >([]);

  const [divisionOpen, setDivisionOpen] = useState(false);
  const [division, setDivision] = useState<string | null>(null);
  const [divisionItems, setDivisionItems] = useState<
    { label: string; value: string }[]
  >([]);

  // GN Division State Hooks
  const [gnDivisionOpen, setGnDivisionOpen] = useState(false);
  const [gnDivision, setGnDivision] = useState<string | null>(null);
  const [gnDivisionItems, setGnDivisionItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [isFetchingGn, setIsFetchingGn] = useState(false);

  const handleRegister = async () => {
    // Validating that GN Division is also selected
    if (
      !phoneNumber ||
      !password ||
      !fullName ||
      !nic ||
      !address ||
      !emergencyContactNumber ||
      !bloodGroup ||
      !district ||
      !province ||
      !division ||
      !gnDivision
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (nic.length !== 12) {
      Alert.alert("Error", "NIC must be exactly 12 characters long.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        phoneNumber: phoneNumber,
        password: password,
        role: "MOTHER",
        fullName: fullName,
        nic: nic,
        address: address,
        emergencyContactNumber: emergencyContactNumber,
        bloodGroup: bloodGroup,
        district: district,
        province: province,
        residentialDivision: division,
        gnDivision: gnDivision, // Adding GN Division to the API Request
        dateOfBirth: dob.toISOString().split("T")[0],
        lastMenstrualPeriod: lmp.toISOString().split("T")[0],
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/users/register`,
        payload,
      );

      Alert.alert(
        "Account Created!",
        "Welcome to MaathaCare. Please log in with your new account.",
        [{ text: "OK", onPress: () => router.replace("/mother-login") }],
      );
    } catch (error) {
      const err = error as any;
      setIsLoading(false);

      console.log("BACKEND REJECTION REASON:", err.response?.data);

      if (err.response) {
        Alert.alert("Server Rejected", `Error Code: ${err.response.status}`);
      } else if (err.request) {
        Alert.alert(
          "Network Blocked",
          "Cannot reach server. Check Wi-Fi and IP.",
        );
      } else {
        Alert.alert("App Error", err.message);
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      nestedScrollEnabled={true}
    >
      <LanguageSwitcher />

      <Text style={styles.title}>{t("createAccount")}</Text>
      <Text style={styles.subtitle}>{t("joinToday")}</Text>

      <Text style={styles.label}>{t("phoneNumber")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderPhone")}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("password")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderPassword")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("confirmPassword")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderConfirm")}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("fullName")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderName")}
        value={fullName}
        onChangeText={setFullName}
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("nicNumber")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderNic")}
        value={nic}
        onChangeText={setNic}
        maxLength={12}
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("emergencyContact")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderEmergency")}
        value={emergencyContactNumber}
        onChangeText={setEmergencyContactNumber}
        keyboardType="phone-pad"
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("homeAddress")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderAddress")}
        value={address}
        onChangeText={setAddress}
        editable={!isLoading}
      />

      <Text style={styles.label}>{t("dateOfBirth")}</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => !isLoading && setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{dob.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDob(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>{t("bloodGroup")}</Text>
      <DropDownPicker
        open={bloodGroupOpen}
        value={bloodGroup}
        items={bloodGroupItems}
        setOpen={setBloodGroupOpen}
        setValue={setBloodGroup}
        setItems={setBloodGroupItems}
        placeholder={t("selectBloodGroup")}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading}
        zIndex={4000}
        listMode="SCROLLVIEW"
      />

      <Text style={styles.label}>{t("lmpDate")}</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => !isLoading && setShowLmpPicker(true)}
      >
        <Text style={styles.dateText}>{lmp.toDateString()}</Text>
      </TouchableOpacity>

      {showLmpPicker && (
        <DateTimePicker
          value={lmp}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowLmpPicker(false);
            if (selectedDate) setLmp(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>{t("province")}</Text>
      <DropDownPicker
        open={provinceOpen}
        value={province}
        items={provinceItems}
        setOpen={setProvinceOpen}
        setValue={setProvince}
        setItems={setProvinceItems}
        placeholder={t("selectProvince")}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading}
        zIndex={3000}
        listMode="SCROLLVIEW"
        onChangeValue={(value) => {
          if (value) {
            setDistrictItems(districtMap[value] || []);
          } else {
            setDistrictItems([]);
          }
          setDistrict(null);
          setDivision(null);
          setDivisionItems([]);
          setGnDivision(null);
          setGnDivisionItems([]);
        }}
      />

      <Text style={styles.label}>{t("district")}</Text>
      <DropDownPicker
        open={districtOpen}
        value={district}
        items={districtItems}
        setOpen={setDistrictOpen}
        setValue={setDistrict}
        setItems={setDistrictItems}
        placeholder={province ? t("selectDistrict") : t("selectProvinceFirst")}
        style={[styles.dropdown, !province && { backgroundColor: "#f0f0f0" }]}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading || !province}
        zIndex={2000}
        listMode="SCROLLVIEW"
        onChangeValue={(value) => {
          if (value) {
            setDivisionItems(mohAreaMap[value] || []);
          } else {
            setDivisionItems([]);
          }
          setDivision(null);
          setGnDivision(null);
          setGnDivisionItems([]);
        }}
      />

      <Text style={styles.label}>{t("residentialDivision")}</Text>
      <DropDownPicker
        open={divisionOpen}
        value={division}
        items={divisionItems}
        setOpen={setDivisionOpen}
        setValue={setDivision}
        setItems={setDivisionItems}
        placeholder={district ? t("selectMohArea") : t("selectDistrictFirst")}
        style={[styles.dropdown, !district && { backgroundColor: "#f0f0f0" }]}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading || !district || divisionItems.length === 0}
        zIndex={1000}
        listMode="SCROLLVIEW"
        // 🟢 FIXED: Added encodeURIComponent to prevent spaces breaking the API
        onChangeValue={async (value) => {
          setGnDivision(null); // Clear previous selection

          if (value) {
            setIsFetchingGn(true); // Start loading spinner
            try {
              // Ask the backend for the specific list
              const response = await axios.get(
                `${API_BASE_URL}/api/locations/gn-divisions?mohArea=${encodeURIComponent(value)}`,
              );

              // Format the string array into the {label, value} objects the dropdown needs
              const formattedItems = response.data.map((gnName: string) => ({
                label: gnName,
                value: gnName,
              }));

              setGnDivisionItems(formattedItems);
            } catch (error) {
              console.error(
                "Failed to fetch GN Divisions from backend:",
                error,
              );
              setGnDivisionItems([]);
              Alert.alert(
                "Error",
                "Could not load GN Divisions for this area. Check server connection.",
              );
            } finally {
              setIsFetchingGn(false); // Stop loading spinner
            }
          } else {
            setGnDivisionItems([]);
          }
        }}
      />

      <Text style={styles.label}>{t("gnDivision") || "GN Division"}</Text>
      <DropDownPicker
        open={gnDivisionOpen}
        value={gnDivision}
        items={gnDivisionItems}
        setOpen={setGnDivisionOpen}
        setValue={setGnDivision}
        setItems={setGnDivisionItems}
        loading={isFetchingGn}
        placeholder={
          isFetchingGn
            ? "Loading divisions..."
            : division
              ? t("selectGnDivision") || "Select GN Division"
              : t("selectMohAreaFirst") || "Select MOH Area first"
        }
        style={[styles.dropdown, !division && { backgroundColor: "#f0f0f0" }]}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={
          isLoading || !division || isFetchingGn || gnDivisionItems.length === 0
        }
        zIndex={500}
        listMode="SCROLLVIEW"
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t("signUp")}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>{t("alreadyHaveAccount")}</Text>
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <Text style={styles.loginLink}>{t("login")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 30 },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
    marginLeft: 2,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  dateInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    justifyContent: "center",
  },
  dateText: { color: "#495057", fontSize: 16 },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    height: 50,
  },
  dropdownContainer: {
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF69B4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    zIndex: 1,
  },
  buttonDisabled: { backgroundColor: "#ffb6c1" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 40,
    zIndex: 1,
  },
  loginText: { color: "#6c757d", fontSize: 15 },
  loginLink: { color: "#FF69B4", fontSize: 15, fontWeight: "bold" },
});
