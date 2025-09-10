import { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Text } from 'react-native';
import { Card, Searchbar, Avatar, Badge } from 'react-native-paper';
import colors from '../../../src/constants/colors';
import Ticket from '../../../src/screens/Tickets/Ticket';
import { deleteTicket, getUserTickets } from '../../../src/api/tickets';
import { useNavigation } from '@react-navigation/native';
import { ePriority, eTicketStatus } from '../../../constants/Enums';

export default function TicketListScreen() {
	const navigation = useNavigation();
	const [search, setSearch] = useState('');
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const filteredTickets = tickets.filter(t =>
		t.ticketNumber.toLowerCase().includes(search.toLowerCase())
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		getUserTickets()
			.then(tickets => {
				if (tickets.success) {
					setTickets(tickets.content.$values);
				}
			})
			.catch(error => {
				console.log(error);
			});
		setRefreshing(false);
	}, []);

	const ticketStatusOptions = Object.entries(eTicketStatus)
		.filter(([key, value]) => typeof value === 'number')
		.map(([label, value]) => ({
			label,
			value,
		}));

	const ticketPriorityOptions = Object.entries(ePriority)
		.filter(([key, value]) => typeof value === 'number')
		.map(([label, value]) => ({
			label,
			value,
		}));

	return (
		<View style={styles.container}>
			<Ticket setLoading={setLoading} setTickets={setTickets} />
			<Searchbar
				placeholder="Search tickets..."
				value={search}
				onChangeText={setSearch}
				style={styles.searchbar}
				iconColor={colors.warning}
				inputStyle={{ color: colors.dark }}
			/>
			{
				loading
					?
					<View style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
					}}>
						<ActivityIndicator size={'large'} />
					</View>
					:
					<FlatList
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
						data={filteredTickets}
						keyExtractor={item => item.id}
						renderItem={({ item, index }) => {
							const statusBg = ticketStatusOptions.find(x => x.value == item.status).label == 'Open' ? '#ffc107' : ticketStatusOptions.find(x => x.value == item.status).label == 'OnHold' ? '#6c757d' : ticketStatusOptions.find(x => x.value == item.status).label == 'Inactive' ? '#7987a1' : ticketStatusOptions.find(x => x.value == item.status).label == 'OutOfService' ? '#ff3366' : '#fbbc06';
							const priorityBg = ticketPriorityOptions.find(x => x.label == item.priority.split(' ').join('')).label == 'Medium' ? '#ffc107' : ticketPriorityOptions.find(x => x.label == item.priority.split(' ').join('')).label == 'High' ? '#dc3545' : ticketPriorityOptions.find(x => x.label == item.priority.split(' ').join('')).label == 'Low' ? '#0dcaf0' : '#c9ced4';

							return (
								<View style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor: '#fff',
									borderRadius: 10,
									paddingVertical: 20,
									paddingHorizontal: 20,
									shadowColor: "#000",
									shadowOffset: {
										width: 0,
										height: 2,
									},
									shadowOpacity: 0.25,
									shadowRadius: 3.84,
									elevation: 5,
									marginTop: index == 0 ? 0 : 10
								}}>
									<Avatar.Icon size={40} icon="alert-circle" color={colors.white} style={{ backgroundColor: colors.warning }} />
									<View style={{
										flex: 1,
										marginHorizontal: 10
									}}>
										<Text style={{ color: '#000', fontWeight: '700', fontSize: 22 }}>{item.ticketNumber}</Text>
										<Text style={{ color: 'grey', fontWeight: '500', fontSize: 16 }}>{item.summary}</Text>
										<Text style={{ alignSelf: 'flex-start', paddingHorizontal: 10, backgroundColor: statusBg, textAlign: 'center', color: '#fff', marginTop: 5, paddingVertical: 3, borderRadius: 5 }}>Status: {ticketStatusOptions.find(x => x.value == item.status).label}</Text>
										<Text style={{ alignSelf: 'flex-start', paddingHorizontal: 10, backgroundColor: priorityBg, textAlign: 'center', color: '#fff', marginTop: 5, paddingVertical: 3, borderRadius: 5 }}>Priority: {ticketPriorityOptions.find(x => x.label == item.priority.split(' ').join('')).label}</Text>
									</View>
									<View style={{ flexDirection: 'row' }}>
										<TouchableOpacity style={{ marginRight: 10 }} onPress={() => { navigation.navigate('UpdateTicket', item) }}><Avatar.Icon icon="pen" size={30} color={colors.white} style={{ backgroundColor: colors.info }} /></TouchableOpacity>
										<TouchableOpacity onPress={() => {
											Alert.alert('Delete Equipment', 'Are you sure you want to delete this ticket?', [
												{
													text: 'No',
													onPress: () => { }
												},
												{
													text: 'Yes',
													onPress: () => {
														setLoading(true);
														deleteTicket(item.id)
															.then((data) => {
																if (data.success) {
																	getUserTickets()
																		.then(tickets => {
																			if (tickets.success) {
																				setTickets(tickets.content.$values);
																				setLoading(false);
																			}
																		})
																		.catch(error => {
																			console.log(error);
																			setLoading(false);
																		});
																	Alert.alert('Delete Ticket', 'Ticket deleted successfully.');
																	setLoading(false);
																}
															})
															.catch(error => {
																console.log(error);
																setLoading(false);
															});
													}
												}
											]);

										}}><Avatar.Icon icon="delete" size={30} color={colors.white} style={{ backgroundColor: colors.danger }} />
										</TouchableOpacity>
									</View>
								</View>
							)
						}}
						contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20, paddingTop: 5 }}
					/>
			}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.light,
		paddingTop: 16
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		color: colors.warning,
		marginBottom: 12,
		textAlign: 'center',
		letterSpacing: 1,
	},
	searchbar: {
		marginBottom: 16,
		borderRadius: 8,
		backgroundColor: colors.white,
		elevation: 1,
		marginHorizontal: 20
	},
	card: {
		marginBottom: 12,
		borderRadius: 10,
		elevation: 2,
		backgroundColor: colors.white,
	},
}); 