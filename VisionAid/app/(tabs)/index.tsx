import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as LocalAuthentication from "expo-local-authentication";
import tw from "twrnc";
import { useAuth } from "../../src/hooks/useAuth";
import { TokenService } from "../../src/services/TokenService";
import { SecureStorageService } from "../../src/services/SecureStorageService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  const router = useRouter();
  const { login, loginWithBiometric, user } = useAuth();

  useEffect(() => {
    checkBiometricSupport();
    checkSavedCredentials();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("face");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("fingerprint");
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType("iris");
        }
      }
    } catch (error) {
      console.log("Biometric check error:", error);
    }
  };

  const checkSavedCredentials = async () => {
    try {
      const hasTokens = await SecureStorageService.hasValidTokens();
      setHasSavedCredentials(hasTokens);
      console.log('Has saved credentials:', hasTokens);
    } catch (error) {
      console.log("Check saved credentials error:", error);
      setHasSavedCredentials(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const saved = await LocalAuthentication.isEnrolledAsync();
      if (!saved) {
        Toast.show({
          type: "error",
          text1: "Chưa thiết lập",
          text2: "Vui lòng thiết lập vân tay hoặc Face ID trong cài đặt thiết bị",
          position: "top",
          visibilityTime: 4000,
        });
        return;
      }

      // Step 1: Biometric Authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực để đăng nhập",
        cancelLabel: "Hủy",
        disableDeviceFallback: false,
      });

      if (!result.success) {
        Toast.show({
          type: "error",
          text1: "Xác thực thất bại",
          text2: "Vui lòng thử lại",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      // Step 2: Get refresh token and authenticate with backend
      setLoading(true);
      
      const tokenResult = await TokenService.authenticateWithBiometricAndRefresh();

      if (tokenResult.success) {
        Toast.show({
          type: "success",
          text1: "Thành công!",
          text2: "Đăng nhập bằng sinh trắc học thành công!",
          position: "top",
          visibilityTime: 2000,
        });

        setTimeout(() => {
          router.push("/(tabs)/main");
        }, 500);
      } else {
        // Handle different error scenarios
        if (tokenResult.shouldRelogin) {
          // Refresh token expired or invalid - need to login again
          Toast.show({
            type: "error",
            text1: "Phiên đăng nhập hết hạn",
            text2: tokenResult.error || "Vui lòng đăng nhập lại",
            position: "top",
            visibilityTime: 5000,
          });
          
          // Clear saved credentials
          await SecureStorageService.clearTokens();
          setHasSavedCredentials(false);
        } else {
          // Network or other error
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: tokenResult.error || "Không thể đăng nhập. Vui lòng thử lại",
            position: "top",
            visibilityTime: 4000,
          });
        }
      }
    } catch (error) {
      console.log("Biometric auth error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể sử dụng xác thực sinh trắc học",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Lỗi đăng nhập",
        text2: "Vui lòng nhập đầy đủ thông tin",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: "Đăng nhập thành công!",
        position: "top",
        visibilityTime: 2000,
      });
      
      setTimeout(() => {
        router.push("/(tabs)/main");
      }, 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Lỗi kết nối API";
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: errorMessage,
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#5EB8FF", "#052136"]} 
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={tw`flex-1 w-full h-full`}
    >
      <ScrollView 
        contentContainerStyle={tw`flex-grow justify-center items-center py-8 px-5`}
        keyboardShouldPersistTaps="handled"
      >
        <View style={tw`w-[96%] max-w-[420px] bg-white/98 rounded-3xl py-7 px-5.5 items-center shadow-2xl`}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/placeholder.png")}
            style={tw`w-40 h-20 mb-2`}
            resizeMode="contain"
          />


          {/* Email Input */}
          <TextInput
            style={tw`w-full border border-gray-900 rounded-xl py-3.5 px-4 mb-3 bg-white text-base text-gray-900`}
            placeholder="Email/ Số điện thoại"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input with Eye Icon */}
          <View style={tw`w-full flex-row items-center border border-gray-900 rounded-xl mb-1.5 bg-white`}>
            <TextInput
              style={tw`flex-1 py-3.5 px-4 text-base text-gray-900`}
              placeholder="Mật khẩu"
              placeholderTextColor="#6B7280"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={tw`px-3 justify-center items-center`} 
              onPress={() => setSecureText(!secureText)}
            >
              <Ionicons 
                name={secureText ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#111827" 
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={tw`w-full items-end mb-3`}>
            <Text style={tw`underline text-gray-900 text-sm`}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Remember Me Switch */}
          <View style={tw`w-full flex-row items-center mb-3`}>
            <Switch value={rememberMe} onValueChange={setRememberMe} />
            <Text style={tw`ml-2 text-gray-900`}>Ghi nhớ đăng nhập</Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={onLogin} 
            disabled={loading} 
            style={tw`w-full`}
          >
            <LinearGradient 
              colors={["#2A7BD7", "#0A3A66"]} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={tw`w-full py-3.5 rounded-xl items-center justify-center shadow-lg`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white font-bold text-base`}>Đăng nhập</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Biometric Authentication Options */}
          {isBiometricSupported && hasSavedCredentials && (
            <>
              <View style={tw`w-full flex-row items-center my-5`}>
                <View style={tw`flex-1 h-px bg-gray-300`} />
                <Text style={tw`mx-3 text-gray-500 text-xs`}>Hoặc đăng nhập bằng</Text>
                <View style={tw`flex-1 h-px bg-gray-300`} />
              </View>

              <View style={tw`flex-row justify-center items-center gap-5 mb-2`}>
                {biometricType === "fingerprint" && (
                  <TouchableOpacity 
                    style={tw`items-center justify-center`}
                    onPress={handleBiometricAuth}
                    disabled={loading}
                  >
                    <View style={tw`w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-600 justify-center items-center mb-1.5 ${loading ? 'opacity-50' : ''}`}>
                      <Ionicons name="finger-print" size={32} color="#2A7BD7" />
                    </View>
                    <Text style={tw`text-gray-900 text-xs font-semibold`}>Vân tay</Text>
                  </TouchableOpacity>
                )}

                {biometricType === "face" && (
                  <TouchableOpacity 
                    style={tw`items-center justify-center`}
                    onPress={handleBiometricAuth}
                    disabled={loading}
                  >
                    <View style={tw`w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-600 justify-center items-center mb-1.5 ${loading ? 'opacity-50' : ''}`}>
                      <Ionicons name="scan" size={32} color="#2A7BD7" />
                    </View>
                    <Text style={tw`text-gray-900 text-xs font-semibold`}>Khuôn mặt</Text>
                  </TouchableOpacity>
                )}

                {biometricType === "iris" && (
                  <TouchableOpacity 
                    style={tw`items-center justify-center`}
                    onPress={handleBiometricAuth}
                    disabled={loading}
                  >
                    <View style={tw`w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-600 justify-center items-center mb-1.5 ${loading ? 'opacity-50' : ''}`}>
                      <Ionicons name="eye" size={32} color="#2A7BD7" />
                    </View>
                    <Text style={tw`text-gray-900 text-xs font-semibold`}>Mống mắt</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Register Link */}
          <View style={tw`flex-row mt-4.5`}>
            <Text style={tw`text-gray-900`}>Bạn chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/register")}>
              <Text style={tw`text-blue-700 font-bold underline`}> Đăng kí ngay!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}