import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';


const CustomDropdown = ({ data, placeholder, onValueChange, value, required, error }) => {

    const renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
                {item.value === value && (
                    <AntDesign
                        style={styles.icon}
                        color="black"
                        name="Safety"
                        size={20}
                    />
                )}
            </View>
        );
    };

    return (
        <Dropdown
            style={[styles.dropdown, error && { borderColor: 'red' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data}
            search={false}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={placeholder + (required ? ' *' : '')}
            searchPlaceholder="Search..."
            value={value}
            onChange={(data) => {
                onValueChange(data.value)
            }}
            renderItem={renderItem}
        />
    );
};

export default CustomDropdown;

const styles = StyleSheet.create({
    dropdown: {
        marginVertical: 5,
        height: 50,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#000'
    },
    icon: {
        marginRight: 5,
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 16,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});