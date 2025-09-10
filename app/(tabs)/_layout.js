import { Drawer } from 'expo-router/drawer';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image, View } from 'react-native';
import colors from '../../src/constants/colors';

export default function DrawerLayout() {
  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 30,
          backgroundColor: '#fff',
        }}>
          <Image
            source={require('../../assets/images/darklogo.png')} // Replace with your logo path
            style={{
              width: 120,
              height: 80,
            }}
            resizeMode="contain"
          />
        </View>

        <View style={{ flex: 1, paddingTop: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
    );
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => {
        let iconName;

        switch (route.name) {
          case 'index': iconName = 'home'; break;
          case 'assets/index': iconName = 'car'; break;
          case 'equipment/index': iconName = 'cog'; break;
          case 'tickets/index': iconName = 'list'; break;
          case 'profile/index': iconName = 'person'; break;
          case 'expense/index': iconName = 'cash'; break;
          case 'servicescheduling/index': iconName = 'calendar'; break;
          case 'renewal/index': iconName = 'refresh'; break;
          case 'trackassets/index': iconName = 'map'; break;
          default: iconName = 'apps';
        }

        return {
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.gray,
          drawerIcon: ({ color, size }) => (
            route.name == 'trackassets/index' ? <Entypo name="globe" size={size} color={color} /> : <Ionicons name={iconName} size={size} color={color} />
          ),
        };
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="assets/index" options={{ title: 'Assets' }} />
      <Drawer.Screen name="equipment/index" options={{ title: 'Equipment' }} />
      <Drawer.Screen name="tickets/index" options={{ title: 'Tickets' }} />
      <Drawer.Screen name="expense/index" options={{ title: 'Expense' }} />
      <Drawer.Screen name="servicescheduling/index" options={{ title: 'Service' }} />
      <Drawer.Screen name="renewal/index" options={{ title: 'Renewal' }} />
      <Drawer.Screen name="trackassets/index" options={{ title: 'Track Assets' }} />
      <Drawer.Screen name="profile/index" options={{ title: 'Profile' }} />
    </Drawer>
  );
} 