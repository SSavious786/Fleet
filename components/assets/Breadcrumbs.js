import { Text, View } from "react-native";

function Breadcrumbs({title, crumb}) {
    return (
        <View>
            {/* <Text style={{
                fontSize: 16,
                color: '#000',
                fontWeight: '500'
            }}>{title}</Text> */}

            <Text style={{
                color: '#0acf97',
                marginTop: 2
            }}>{title} <Text style={{color: '#6c757d'}}>/ {crumb}</Text></Text>
        </View>
    )
}

export default Breadcrumbs;