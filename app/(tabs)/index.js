import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import colors from '../../src/constants/colors';
import { getCompanyIdFromToken } from '../../src/api/getCompanyIdFromToken';
import { useDashboardStats } from '../../src/api/useDashboardStats';
import { Card } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import Breadcrumbs from '../../components/assets/Breadcrumbs';
import { Avatar } from 'react-native-paper';
import { getDashboardStats } from '../../src/api/dashboard';

const { width: screenWidth } = Dimensions.get('window');

export default function AdminDashboard() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(false);
	const [activeTicketTab, setActiveTicketTab] = useState('TICKET #');
	const [activeAssetTab, setActiveAssetTab] = useState('NAME');

	useEffect(() => {
		setLoading(true);
		getCompanyIdFromToken()
			.then(id => {
				getDashboardStats(id)
					.then(data => {
						setStats(data);
						setLoading(false);
					})
					.catch(err => {
						setError(err.message);
						setLoading(false);
					});
			})
			.catch(err => {
				console.log(err);
				setLoading(false);
			});
	}, []);

	const sampleAssets = [
		{ id: '1', name: 'Assets 001', type: 'Assets', status: 'Assets' },
		{ id: '2', name: 'Assets 002', type: 'Assets', status: 'Assets' },
	];
	const sampleTickets = [
		{ id: '1', name: 'Tickets 001', type: 'Tickets', status: 'Active' },
		{ id: '2', name: 'Tickets 002', type: 'Tickets', status: 'Inactive' },
	];

	// Sample data with more points to demonstrate non-scrollable behavior
	const assetsChartData = [
		{ value: 20, label: 'Dec 28' },
		{ value: 35, label: 'Dec 29' },
		{ value: 25, label: 'Dec 30' },
		{ value: 45, label: 'Dec 31' },
		{ value: 30, label: 'Jan 01' },
		{ value: 40, label: 'Jan 02' },
		{ value: 35, label: 'Jan 03' },
		{ value: 28, label: 'Jan 04' },
		{ value: 42, label: 'Jan 05' },
		{ value: 38, label: 'Jan 06' },
		{ value: 33, label: 'Jan 07' },
		{ value: 47, label: 'Jan 08' },
	];

	const ticketsChartData = [
		{ value: 25, label: 'Dec 25' },
		{ value: 30, label: 'Dec 26' },
		{ value: 35, label: 'Dec 27' },
		{ value: 40, label: 'Dec 28' },
		{ value: 45, label: 'Dec 29' },
		{ value: 35, label: 'Dec 30' },
		{ value: 30, label: 'Dec 31' },
		{ value: 25, label: 'Jan 01' },
		{ value: 20, label: 'Jan 02' },
		{ value: 36, label: 'Jan 03' },
	];

	const equipmentChartData = [
		{ value: 10, label: 'Dec 30' },
		{ value: 15, label: 'Dec 31' },
		{ value: 20, label: 'Jan 01' },
		{ value: 18, label: 'Jan 02' },
		{ value: 12, label: 'Jan 03' },
		{ value: 25, label: 'Jan 04' },
		{ value: 35, label: 'Jan 05' },
		{ value: 52, label: 'Jan 06' },
		{ value: 28, label: 'Jan 07' },
		{ value: 45, label: 'Jan 08' },
	];

	const DashboardCard = ({ title, count, chartType, data }) => {
		const [focusIndex, setFocusIndex] = useState(-1);
		const [timeoutId, setTimeoutId] = useState(null);

		// Auto-hide tooltip after 2 seconds
		const hideTooltipAfterDelay = () => {
			// Clear existing timeout if any
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// Set new timeout to hide tooltip after 2 seconds
			const newTimeoutId = setTimeout(() => {
				setFocusIndex(-1);
			}, 2000);

			setTimeoutId(newTimeoutId);
		};

		// Clean up timeout on component unmount
		React.useEffect(() => {
			return () => {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			};
		}, [timeoutId]);

		// Smaller chart width for more compact scrollable content
		const containerWidth = screenWidth - 80; // Container width (card width)
		const chartWidth = Math.max(containerWidth, data.length * 25); // Reduced to 25px per data point

		// Use original data without sampling
		const processedData = data;
		const dataPoints = processedData.length;

		// Calculate spacing and bar width for compact viewing
		let spacing, barWidth;

		if (chartType === 'bar') {
			// Smaller bar width and spacing for compact appearance
			barWidth = 16; // Reduced from 24px to 16px
			spacing = 6; // Reduced from 16px to 8px
		} else {
			// Line chart spacing - more compact spacing for smooth scrolling
			spacing = 20; // Reduced from 40px to 25px
		}

		// Calculate tooltip position based on chart type
		const getTooltipX = (index) => {
			if (chartType === 'bar') {
				return 60 + (index * (barWidth + spacing)) + (barWidth / 2);
			} else {
				return 60 + (index * spacing);
			}
		};

		const handleFocus = (item, index) => {
			setFocusIndex(index);
			hideTooltipAfterDelay(); // Start 2-second countdown
		};

		const renderTooltip = () => {
			if (focusIndex === -1) return null;

			const tooltipX = getTooltipX(focusIndex);

			return (
				<View
					style={[
						styles.tooltipModal,
						{
							left: tooltipX - 35, // Center on point
						},
					]}
					pointerEvents="none"
				>
					<Text style={styles.tooltipDate}>{processedData[focusIndex]?.label}</Text>
					<Text style={styles.tooltipValue}>{processedData[focusIndex]?.value}</Text>
				</View>
			);
		};

		return (
			<Card style={[styles.card, { padding: 20 }]}>
				<View style={styles.cardHeader}>
					<Text style={styles.cardTitle}>{title}</Text>
					<View style={styles.cardHeaderRight}>
						<Text style={styles.cardCount}>{count || 0}</Text>
						<MaterialIcons name="more-horiz" size={24} color={colors.gray} />
					</View>
				</View>
				<View style={styles.cardContent}>
					<ScrollView
						horizontal={true}
						showsHorizontalScrollIndicator={true}
						style={styles.chartScrollView}
						contentContainerStyle={styles.chartScrollContent}
					>
						<View style={[styles.chartContainer, { width: chartWidth }]}>
							{renderTooltip()}
							{chartType === 'line' ? (
								<LineChart
									data={processedData}
									width={chartWidth}
									height={70}
									isAnimated
									showDataPoint
									showLine
									color="#10B981"
									dataPointsColor="#10B981"
									dataPointsRadius={2}
									showVerticalLines={false}
									xAxisLabelTextStyle={{ display: 'none' }}
									yAxisTextStyle={{ display: 'none' }}
									yAxisColor="transparent"
									xAxisColor="transparent"
									hideAxesAndRules
									showStripOnPress={false}
									onFocus={(item, index) => handleFocus(item, index)}
									focusEnabled={true}
									showTextOnFocus={false}
									showStripOnFocus={false}
									onFocusOut={() => {
										if (timeoutId) clearTimeout(timeoutId);
										setFocusIndex(-1);
									}}
									scrollToEnd={false}
									disableScroll={true}
									spacing={spacing}
									initialSpacing={1}
									endSpacing={12}
								/>
							) : (
								<BarChart
									data={processedData}
									width={chartWidth}
									height={70}
									barWidth={barWidth}
									barBorderRadius={2}
									frontColor="#10B981"
									isAnimated
									showStripOnPress={false}
									showXAxisIndices={false}
									xAxisLabelTextStyle={{ display: 'none' }}
									yAxisTextStyle={{ display: 'none' }}
									yAxisColor="transparent"
									xAxisColor="transparent"
									hideAxesAndRules
									onPress={(item, index) => handleFocus(item, index)}
									focusEnabled={true}
									showTextOnFocus={false}
									showStripOnFocus={false}
									onFocusOut={() => {
										if (timeoutId) clearTimeout(timeoutId);
										setFocusIndex(-1);
									}}
									scrollToEnd={false}
									disableScroll={true}
									spacing={spacing}
									initialSpacing={1}
									endSpacing={12}
								/>
							)}
						</View>
					</ScrollView>
				</View>
			</Card>
		);
	};

	// Render list item component
	const renderTicketItem = ({ item }) => (
		<Card style={styles.card}>
			<Card.Title
				title={item.name}
				subtitle={`${item.type} • ${item.status}`}
				left={props => <Avatar.Icon {...props} icon="fuel" color={colors.white} style={{ backgroundColor: colors.primary }} />}
			/>
		</Card>
	);

	const renderAssetItem = ({ item }) => (
		<Card style={styles.card}>
			<Card.Title
				title={item.name}
				subtitle={`${item.type} • ${item.status}`}
				left={props => <Avatar.Icon {...props} icon="fuel" color={colors.white} style={{ backgroundColor: colors.primary }} />}
			/>
		</Card>
	);

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
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Breadcrumbs title={'Home'} crumb={'Dashboard'} />
					<Text style={styles.title}>Welcome to Dashboard</Text>
				</View>

				<View style={styles.cardsContainer}>
					<DashboardCard
						title="ASSETS"
						count={stats?.assetCount}
						chartType="line"
						data={assetsChartData}
					/>
					<DashboardCard
						title="TICKETS"
						count={stats?.ticketCount}
						chartType="bar"
						data={ticketsChartData}
					/>
					<DashboardCard
						title="EQUIPMENT"
						count={stats?.equipmentCount}
						chartType="line"
						data={equipmentChartData}
					/>
				</View>

				{/* Tickets Section */}
				<View style={styles.listSection}>
					<Text style={styles.sectionTitle}>Recent Tickets</Text>
					<FlatList
						data={sampleTickets}
						keyExtractor={item => item.id}
						renderItem={renderTicketItem}
						scrollEnabled={false}
						nestedScrollEnabled={true}
						contentContainerStyle={styles.listContainer}
					/>
				</View>

				{/* Assets Section */}
				<View style={styles.listSection}>
					<Text style={styles.sectionTitle}>Recent Assets</Text>
					<FlatList
						data={sampleAssets}
						keyExtractor={item => item.id}
						renderItem={renderAssetItem}
						scrollEnabled={false}
						nestedScrollEnabled={true}
						contentContainerStyle={styles.listContainer}
					/>
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>
						Copyright © 2024 <Text style={styles.footerLink}>Track IO</Text>.
					</Text>
				</View>
			</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.light },
	header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
	breadcrumb: { fontSize: 14, color: colors.gray, marginBottom: 8 },
	title: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
	cardsContainer: { paddingHorizontal: 20, paddingTop: 20 },
	card: {
		backgroundColor: '#fff',
		padding: 1,
		borderRadius: 12,
		elevation: 2,
		marginBottom: 16,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	cardHeaderRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	cardTitle: {
		fontSize: 12,
		fontWeight: '600',
		color: colors.gray,
		letterSpacing: 0.5,
		textTransform: 'uppercase',
	},
	cardContent: {
		width: '100%',
	},
	chartScrollView: {
		width: '100%',
	},
	chartScrollContent: {
		paddingVertical: 0,
	},
	cardCount: {
		fontSize: 24,
		fontWeight: 'bold',
		color: colors.primary
	},
	chartContainer: {
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		overflow: 'visible',
		position: 'relative',
		marginTop: 0,
		marginBottom: 0,
		paddingTop: 20, // Reduced space for tooltip
		paddingLeft: 0,
		paddingRight: 0,
		paddingBottom: 3,
		marginLeft: 0, // Adjusted for tooltip alignment
	},
	tableCard: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 12,
		elevation: 2,
		marginBottom: 16,
	},
	tabContainer: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e5e5',
		marginBottom: 16,
	},
	tab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 16 },
	activeTab: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
	tabText: { fontSize: 14, color: colors.gray, fontWeight: '500' },
	activeTabText: { color: '#10B981' },
	loadingContainer: { flexDirection: 'row', alignItems: 'center' },
	loadingBar: { width: 60, height: 4, backgroundColor: '#10B981', borderRadius: 2, marginRight: 8 },
	loadingText: { fontSize: 12, color: colors.gray },
	tablesContainer: { paddingHorizontal: 20, paddingTop: 20 },
	listSection: {

		paddingTop: 20
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: colors.primary,
		paddingHorizontal: 20
	},
	listContainer: {
		marginTop: 20,
		marginHorizontal: 20
	},
	footer: { paddingHorizontal: 20, paddingVertical: 30, alignItems: 'center' },
	footerText: { fontSize: 12, color: colors.gray },
	footerLink: { color: '#3B82F6' },
	tooltipModal: {
		position: 'absolute',
		backgroundColor: '#fff',
		borderRadius: 4,
		padding: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 5,
		borderWidth: 1,
		borderColor: '#e5e5e5',
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 70,
		zIndex: 1000,
	},
	tooltipDate: { fontSize: 10, color: colors.gray, marginBottom: 2, fontWeight: '500' },
	tooltipValue: { fontSize: 12, fontWeight: 'bold', color: '#10B981' },
});