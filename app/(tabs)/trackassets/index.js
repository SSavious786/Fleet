import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAssetMapMarkers } from '../../../src/api/trackassets';
import { getUserDataFromToken } from '../../../src/api/getCompanyIdFromToken';

export default function TrackAssetsScreen() {
    const [markers, setMarkers] = useState([]);
    const [initalRegion, setInitialRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
    })
    const [loading, setLoading] = useState(false);

    async function getMarkers() {
        setLoading(true);
        getUserDataFromToken()
            .then(data => {
                getAssetMapMarkers(data.sub)
                    .then(mark => {
                        if (mark.success) {
                            setMarkers(mark.data.$values);

                            setInitialRegion({
                                latitude: mark.data.$values[0].latitude,
                                longitude: mark.data.$values[0].longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            });
                        }
                        setLoading(false);
                    })
                    .catch(error => {
                        console.log(error);
                        setLoading(false);
                    });
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }

    useEffect(() => {
        getMarkers();
    }, []);

    return (
        loading
            ?
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff'
            }}>
                <ActivityIndicator size={'large'} />
            </View>
            :
            <MapView
                style={{
                    ...StyleSheet.absoluteFillObject,
                }}
                initialRegion={initalRegion}
            >
                {
                    markers.map((element, index) => {
                        return (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: element.latitude,
                                    longitude: element.longitude,
                                }}
                                title={element.name}
                            />
                        )
                    })
                }
                <Marker
                    coordinate={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                    }}
                    title="My Marker"
                    description="This is a description of the marker"
                />
            </MapView>
    )
}