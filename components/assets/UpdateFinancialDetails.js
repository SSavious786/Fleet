import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, Platform, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import CustomDropdown from '../assets/CustomDropdown';
import { MaterialIcons } from '@expo/vector-icons';

function UpdateFinancialDetails({ onSubmitSuccess, assetDetails, initialData = {} }) {
    const [purchaseVendor, setPurchaseVendor] = useState(assetDetails.financialDetail.purchaseVendor);
    const [purchasePrice, setPurchasePrice] = useState(assetDetails.financialDetail.purchasePrice);
    // Purchase Date state and picker
    const [purchaseDate, setPurchaseDate] = useState(new Date(assetDetails.financialDetail.purchaseDate));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showdateOfLoanPicker, setShowdateOfLoanPicker] = useState(false);
    const [showloanEndDatePicker, setShowloanEndDatePicker] = useState(false);
    const [showDateOfLeasePicker, setShowDateOfLeasePicker] = useState(false);
    const [showfirstPaymentDateLeasePicker, setShowfirstPaymentDateLeasePicker] = useState(false);
    const [showLeaseEndDatePicker, setShowLeaseEndDatePicker] = useState(false);
    const [purchaseDateDisplay, setPurchaseDateDisplay] = useState(new Date(assetDetails.financialDetail.purchaseDate));
    const [odometer, setOdometer] = useState(assetDetails.financialDetail.odometer);
    const [note, setNote] = useState(assetDetails.financialDetail.purchaseVendor);
    const [financialType, setFinancialType] = useState(assetDetails.financialDetail.financialType == 10 ? 'None' : assetDetails.financialDetail.financialType == 20 ? 'Loan' : 'Lease');

    //loan inpuuts
    const [loanLender, setloanLender] = useState(assetDetails.financialDetail.purchaseVendor);
    const [dateOfLoan, setDateOfLoan] = useState(new Date());
    const [amountOfLoan, setamountOfLoan] = useState('');
    const [annualPercentageRate, setannualPercentageRate] = useState('');
    const [downPaymentLoan, setdownPaymentLoan] = useState('');
    const [firstPaymentDate, setfirstPaymentDate] = useState(new Date());
    const [montlyPayment, setmontlyPayment] = useState('');
    const [numberOfPayments, setnumberOfPayments] = useState('');
    const [loanEndDate, setloanEndDate] = useState(new Date());
    const [accoutNumber, setaccoutNumber] = useState('');
    const [loaNotes, setloaNotes] = useState('');

    //lease inpuuts
    const [leaseVendor, setleaseVendor] = useState('');
    const [dateOfLease, setdateOfLease] = useState(new Date());
    const [capitalizedCost, setcapitalizedCost] = useState('');
    const [downPaymentLease, setdownPaymentLease] = useState('');
    const [firstPaymentDateLease, setfirstPaymentDateLease] = useState(new Date());
    const [montlyPaymentLease, setmontlyPaymentLease] = useState('');
    const [numberOfPaymentsLease, setnumberOfPaymentsLease] = useState('');
    const [LeaseEndDate, setLeaseEndDate] = useState(new Date());
    const [residualValue, setresidualValue] = useState('');
    const [contractMileageCap, setcontractMileageCap] = useState('');
    const [excessMileageCharge, setexcessMileageCharge] = useState('');
    const [leaseNumber, setleaseNumber] = useState('');
    const [leaseNotes, setleaseNotes] = useState('');

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    const onSubmit = () => {
        if (validate()) {
            if (financialType == 'Loan') {
                const financialTypeLoanData = {
                    purchaseVendor,
                    purchasePrice,
                    purchaseDate: purchaseDate ? purchaseDate.toISOString().split('T')[0] : '',
                    odometer,
                    note,
                    financialType: financialType == 'Loan' ? 20 : financialType == 'Lease' ? 30 : 10,
                    loanDetail: {
                        lender: loanLender,
                        dateOfLoan: dateOfLoan,
                        amountOfLoan: amountOfLoan,
                        annualPercentageRate: annualPercentageRate,
                        downPayment: downPaymentLoan,
                        firstPaymentDate: firstPaymentDate,
                        monthlyPayment: montlyPayment,
                        numberOfPayments: numberOfPayments,
                        loanEndDate: loanEndDate,
                        accountNumber: accoutNumber,
                        notes: loaNotes
                    },
                    leaseDetail: null
                }
                if (onSubmitSuccess) {
                    onSubmitSuccess(financialTypeLoanData); // Send data to parent
                }
            }
            else if (financialType == 'Lease') {
                const financialTypeLoanData = {
                    purchaseVendor,
                    purchasePrice,
                    purchaseDate: purchaseDate ? purchaseDate.toISOString().split('T')[0] : '',
                    odometer,
                    note,
                    financialType: financialType == 'Loan' ? 20 : financialType == 'Lease' ? 30 : 10,
                    loanDetail: null,
                    leaseDetail: {
                        vendor: leaseVendor,
                        dateOfLease: dateOfLease,
                        capitalizedCost: capitalizedCost,
                        downPayment: parseInt(downPaymentLease),
                        firstPaymentDate: firstPaymentDateLease,
                        monthlyPayment: parseInt(montlyPaymentLease),
                        numberOfPayments: parseInt(numberOfPaymentsLease),
                        leaseEndDate: LeaseEndDate,
                        buyoutAmount: 0,
                        residualValue: residualValue,
                        contractMileageCap: contractMileageCap,
                        excessMileageCharge: excessMileageCharge,
                        leaseNumber: leaseNumber,
                        accountNumber: 0,
                        notes: leaseNotes
                    }
                }
                if (onSubmitSuccess) {
                    onSubmitSuccess(financialTypeLoanData); // Send data to parent
                }
            }
            else {
                const noFinancialTypeData = {
                    purchaseVendor,
                    purchasePrice,
                    purchaseDate: purchaseDate ? purchaseDate.toISOString().split('T')[0] : '',
                    odometer,
                    note,
                    financialType: financialType == 'Loan' ? 20 : financialType == 'Lease' ? 30 : 10,
                    loanDetail: null,
                    leaseDetail: null
                }
                if (onSubmitSuccess) {
                    onSubmitSuccess(noFinancialTypeData); // Send data to parent
                }
            }

        } else {
            setTouched({
                purchaseVendor: true,
                purchasePrice: true,
                purchaseDate: true,
                odometer: true,
                loanLender: true,
                dateOfLoan: true,
                amountOfLoan: true,
                annualPercentageRate: true,
                downPaymentLoan: true,
                firstPaymentDate: true,
                montlyPayment: true,
                numberOfPayments: true,
                loanEndDate: true,
                accoutNumber: true,
                loaNotes: true,
                leaseVendor: true,
                dateOfLease: true,
                loanLender: true,
                loanLender: true,
                capitalizedCost: true,
                downPaymentLease: true,
                firstPaymentDateLease: true,
                montlyPaymentLease: true,
                numberOfPaymentsLease: true,
                LeaseEndDate: true,
                residualValue: true,
                contractMileageCap: true,
                excessMileageCharge: true,
                leaseNumber: true,
            });
        }
    };

    // Initialize form with initial data if provided
    useEffect(() => {
        // Only initialize if we have actual initial data (for edit mode) and haven't initialized yet
        if (initialData && Object.keys(initialData).length > 0 && !isInitialized) {
            setPurchaseVendor(initialData.purchaseVendor || '');
            setPurchasePrice(initialData.purchasePrice || '');
            if (initialData.purchaseDate) {
                const date = new Date(initialData.purchaseDate);
                setPurchaseDate(date);
                setPurchaseDateDisplay(date.toDateString());
            }
            setOdometer(initialData.odometer || '');
            setNote(initialData.note || '');
            setFinancialType(initialData.financialType || 'None');
            if (initialData.financialType == 'Loan') {
                setloanLender(initialData.loanLender || '');
                setDateOfLoan(initialData.dateOfLoan || '');
                setamountOfLoan(initialData.amountOfLoan || '');
                setannualPercentageRate(initialData.annualPercentageRate || '');
                setdownPaymentLoan(initialData.downPaymentLoan || '');
                setfirstPaymentDate(initialData.firstPaymentDate || '');
                setmontlyPayment(initialData.montlyPayment || '');
                setnumberOfPayments(initialData.numberOfPayments || '');
                setloanEndDate(initialData.loanEndDate || '');
                setaccoutNumber(initialData.accoutNumber || '');
                setloaNotes(initialData.loaNotes || '');
            }
            if (initialData.financialType == 'Lease') {
                setleaseVendor(initialData.leaseVendor || '');
                setdateOfLease(initialData.dateOfLease || '');
                setcapitalizedCost(initialData.capitalizedCost || '');
                setdownPaymentLease(initialData.downPaymentLease || '');
                setfirstPaymentDateLease(initialData.firstPaymentDateLease || '');
                setmontlyPaymentLease(initialData.montlyPaymentLease || '');
                setnumberOfPaymentsLease(initialData.numberOfPaymentsLease || '');
                setLeaseEndDate(initialData.LeaseEndDate || '');
                setresidualValue(initialData.residualValue || '');
                setcontractMileageCap(initialData.contractMileageCap || '');
                setexcessMileageCharge(initialData.excessMileageCharge || '');
                setleaseNumber(initialData.leaseNumber || '');
                setleaseNotes(initialData.leaseNotes || '');
            }
            setIsInitialized(true);
        }
    }, [initialData, isInitialized]); // Re-run when initialData changes or initialization status changes

    const validate = () => {
        const newErrors = {};
        if (!purchaseVendor) newErrors.purchaseVendor = 'Purchase Vendor is required';
        if (!purchasePrice) newErrors.purchasePrice = 'Purchase Price is required';
        if (!purchaseDateDisplay) newErrors.purchaseDate = 'Purchase Date is required';
        if (!odometer) newErrors.odometer = 'Odometer is required';
        if (financialType == 'Loan') {
            if (!loanLender) newErrors.loanLender = 'Loan Lender is required';
            if (!amountOfLoan) newErrors.amountOfLoan = 'Ammount of Loan is required';
            if (!annualPercentageRate) newErrors.annualPercentageRate = 'Annual Percentage is required';
            if (!downPaymentLoan) newErrors.downPaymentLoan = 'Down Payment is required';
            if (!montlyPayment) newErrors.montlyPayment = 'Monthly Payment is required';
            if (!numberOfPayments) newErrors.numberOfPayments = 'Number of Payments is required';
            if (!accoutNumber) newErrors.accoutNumber = 'Account Number is required';
        }
        if (financialType == 'Lease') {
            if (!leaseVendor) newErrors.leaseVendor = 'Lease Vendor is required';
            if (!capitalizedCost) newErrors.capitalizedCost = 'Capitalized Cost is required';
            if (!downPaymentLease) newErrors.downPaymentLease = 'Down Payment is required';
            if (!montlyPaymentLease) newErrors.montlyPaymentLease = 'Monthly Payment is required';
            if (!numberOfPaymentsLease) newErrors.numberOfPaymentsLease = 'Number of Payments is required';
            if (!residualValue) newErrors.residualValue = 'Residual Value is required';
            if (!contractMileageCap) newErrors.contractMileageCap = 'Contract Mileage Cap is required';
            if (!excessMileageCharge) newErrors.excessMileageCharge = 'Excess Mileage Charge is required';
            if (!leaseNumber) newErrors.leaseNumber = 'Lease Number is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    const inputTheme = {
        colors: {
            text: '#000',
            placeholder: 'silver',
            background: '#fff',
        },
        roundness: 8,
    };

    const dropdownProps = {
        theme: inputTheme,
    };

    return (
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }} style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Purchase Details Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="shopping-cart" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Purchase Details</Text>
                </View>
                <View style={styles.sectionContent}>
                    <TextInput
                        label="Purchase Vendor"
                        mode="outlined"
                        value={purchaseVendor}
                        onChangeText={text => {
                            setPurchaseVendor(text);
                            if (text) setErrors(errors => ({ ...errors, purchaseVendor: undefined }));
                        }}
                        style={styles.input}
                        activeOutlineColor={!!errors.purchaseVendor && (touched.purchaseVendor || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.purchaseVendor && (touched.purchaseVendor || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, purchaseVendor: true }))}
                    />
                    {!!errors.purchaseVendor && (touched.purchaseVendor || touched.submit) && (
                        <HelperText type="error" visible={!!errors.purchaseVendor}>
                            {errors.purchaseVendor}
                        </HelperText>
                    )}

                    <TextInput
                        label="Purchase Price"
                        mode="outlined"
                        value={purchasePrice.toString()}
                        onChangeText={text => {
                            // Only allow numbers
                            if (/^\d*$/.test(text)) {
                                setPurchasePrice(text);
                                if (text) setErrors(errors => ({ ...errors, purchasePrice: undefined }));
                            }
                        }}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="currency-usd" />}
                        right={<>
                            <TextInput.Icon icon="minus" onPress={() => setPurchasePrice(prev => (prev && Number(prev) > 0 ? String(Number(prev) - 1) : '0'))} />
                            <TextInput.Icon icon="plus" onPress={() => setPurchasePrice(prev => (prev ? String(Number(prev) + 1) : '1'))} />
                        </>}
                        style={styles.input}
                        activeOutlineColor={!!errors.purchasePrice && (touched.purchasePrice || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.purchasePrice && (touched.purchasePrice || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, purchasePrice: true }))}
                    />
                    {!!errors.purchasePrice && (touched.purchasePrice || touched.submit) && (
                        <HelperText type="error" visible={!!errors.purchasePrice}>
                            {errors.purchasePrice}
                        </HelperText>
                    )}

                    <TextInput
                        label="Purchase Date"
                        value={purchaseDateDisplay.toDateString()}
                        editable={false}
                        mode="outlined"
                        theme={inputTheme}
                        style={styles.input}
                        outlineColor={!!errors.purchaseDate && (touched.purchaseDate || touched.submit) ? 'red' : '#000'}
                        activeOutlineColor={!!errors.purchaseDate && (touched.purchaseDate || touched.submit) ? 'red' : '#0acf97'}
                        onBlur={() => setTouched(t => ({ ...t, purchaseDate: true }))}
                        right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} forceTextInputFocus={false} />}
                    />
                    {showDatePicker && (
                        <RNDateTimePicker
                            value={purchaseDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setPurchaseDate(selectedDate);
                                    setPurchaseDateDisplay(selectedDate.toDateString());
                                    setErrors(errors => ({ ...errors, purchaseDate: undefined }));
                                }
                            }}
                        />
                    )}
                    {!!errors.purchaseDate && (touched.purchaseDate || touched.submit) && (
                        <HelperText type="error" visible={!!errors.purchaseDate}>
                            {errors.purchaseDate}
                        </HelperText>
                    )}

                    <TextInput
                        label="Odometer"
                        mode="outlined"
                        value={odometer}
                        onChangeText={text => {
                            // Allow negative and positive numbers
                            if (/^-?\d*$/.test(text)) {
                                setOdometer(text);
                                if (text) setErrors(errors => ({ ...errors, odometer: undefined }));
                            }
                        }}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="map-marker-distance" />}
                        right={<Text style={{ marginRight: 10, color: '#888' }}>mi</Text>}
                        style={styles.input}
                        activeOutlineColor={!!errors.odometer && (touched.odometer || touched.submit) ? 'red' : '#0acf97'}
                        outlineColor={!!errors.odometer && (touched.odometer || touched.submit) ? 'red' : '#000'}
                        theme={inputTheme}
                        onBlur={() => setTouched(t => ({ ...t, odometer: true }))}
                    />
                    {!!errors.odometer && (touched.odometer || touched.submit) && (
                        <HelperText type="error" visible={!!errors.odometer}>
                            {errors.odometer}
                        </HelperText>
                    )}

                    <TextInput
                        label="Note"
                        mode="outlined"
                        value={note}
                        onChangeText={setNote}
                        style={[styles.input, { minHeight: 100 }]}
                        multiline
                        numberOfLines={6}
                        theme={{ ...inputTheme, colors: { ...inputTheme.colors, primary: '#0acf97' } }}
                        onBlur={() => setTouched(t => ({ ...t, note: true }))}
                    />
                </View>
            </View>

            {/* Financial Type Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <MaterialIcons name="account-balance" size={24} color="gray" />
                    </View>
                    <Text style={styles.sectionTitle}>Financial Type</Text>
                </View>
                <View style={styles.sectionContent}>
                    <CustomDropdown
                        data={[
                            { label: 'None', value: 'None' },
                            { label: 'Loan', value: 'Loan' },
                            { label: 'Lease', value: 'Lease' },
                        ]}
                        placeholder="Financial Type"
                        value={financialType}
                        onValueChange={val => {
                            setFinancialType(val);
                        }}
                        {...dropdownProps}
                    />
                </View>
            </View>

            {
                financialType == 'Loan' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="balance" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Loan Details</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Lender"
                                mode="outlined"
                                value={loanLender}
                                onChangeText={text => {
                                    setloanLender(text);
                                    if (text) setErrors(errors => ({ ...errors, loanLender: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.loanLender && (touched.loanLender || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.loanLender && (touched.loanLender || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, loanLender: true }))}
                            />
                            {!!errors.loanLender && (touched.loanLender || touched.submit) && (
                                <HelperText type="error" visible={!!errors.loanLender}>
                                    {errors.loanLender}
                                </HelperText>
                            )}

                            <TextInput
                                label="Loan Date"
                                value={dateOfLoan.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.dateOfLoan && (touched.dateOfLoan || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.dateOfLoan && (touched.dateOfLoan || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, dateOfLoan: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowdateOfLoanPicker(true)} forceTextInputFocus={false} />}
                            />
                            {showdateOfLoanPicker && (
                                <RNDateTimePicker
                                    value={dateOfLoan}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowdateOfLoanPicker(false);
                                        if (selectedDate) {
                                            setDateOfLoan(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <TextInput
                                label="Ammount of Loan"
                                mode="outlined"
                                keyboardType="numeric"
                                value={amountOfLoan}
                                onChangeText={text => {
                                    setamountOfLoan(text);
                                    if (text) setErrors(errors => ({ ...errors, amountOfLoan: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.amountOfLoan && (touched.amountOfLoan || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.amountOfLoan && (touched.amountOfLoan || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, amountOfLoan: true }))}
                            />
                            {!!errors.amountOfLoan && (touched.amountOfLoan || touched.submit) && (
                                <HelperText type="error" visible={!!errors.amountOfLoan}>
                                    {errors.amountOfLoan}
                                </HelperText>
                            )}

                            <TextInput
                                label="Annual Percentage Rate"
                                mode="outlined"
                                keyboardType="numeric"
                                value={annualPercentageRate}
                                onChangeText={text => {
                                    setannualPercentageRate(text);
                                    if (text) setErrors(errors => ({ ...errors, annualPercentageRate: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.annualPercentageRate && (touched.annualPercentageRate || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.annualPercentageRate && (touched.annualPercentageRate || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, annualPercentageRate: true }))}
                                right={<TextInput.Icon icon="percent" forceTextInputFocus={false} />}
                            />
                            {!!errors.annualPercentageRate && (touched.annualPercentageRate || touched.submit) && (
                                <HelperText type="error" visible={!!errors.annualPercentageRate}>
                                    {errors.annualPercentageRate}
                                </HelperText>
                            )}

                            <TextInput
                                label="Down Payment"
                                mode="outlined"
                                keyboardType="numeric"
                                value={downPaymentLoan}
                                onChangeText={text => {
                                    setdownPaymentLoan(text);
                                    if (text) setErrors(errors => ({ ...errors, downPaymentLoan: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.downPaymentLoan && (touched.downPaymentLoan || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.downPaymentLoan && (touched.downPaymentLoan || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, downPaymentLoan: true }))}
                            />
                            {!!errors.downPaymentLoan && (touched.downPaymentLoan || touched.submit) && (
                                <HelperText type="error" visible={!!errors.downPaymentLoan}>
                                    {errors.downPaymentLoan}
                                </HelperText>
                            )}

                            <TextInput
                                label="Monthly Payment"
                                mode="outlined"
                                keyboardType="numeric"
                                value={montlyPayment}
                                onChangeText={text => {
                                    setmontlyPayment(text);
                                    if (text) setErrors(errors => ({ ...errors, montlyPayment: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.montlyPayment && (touched.montlyPayment || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.montlyPayment && (touched.montlyPayment || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, montlyPayment: true }))}
                            />
                            {!!errors.montlyPayment && (touched.montlyPayment || touched.submit) && (
                                <HelperText type="error" visible={!!errors.montlyPayment}>
                                    {errors.montlyPayment}
                                </HelperText>
                            )}

                            <TextInput
                                label="Number of Payments"
                                mode="outlined"
                                keyboardType="numeric"
                                value={numberOfPayments}
                                onChangeText={text => {
                                    setnumberOfPayments(text);
                                    if (text) setErrors(errors => ({ ...errors, numberOfPayments: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.numberOfPayments && (touched.numberOfPayments || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.numberOfPayments && (touched.numberOfPayments || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, numberOfPayments: true }))}
                            />
                            {!!errors.numberOfPayments && (touched.numberOfPayments || touched.submit) && (
                                <HelperText type="error" visible={!!errors.numberOfPayments}>
                                    {errors.numberOfPayments}
                                </HelperText>
                            )}

                            <TextInput
                                label="Loan End Date"
                                value={loanEndDate.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, End: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowloanEndDatePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showloanEndDatePicker && (
                                <RNDateTimePicker
                                    value={loanEndDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowloanEndDatePicker(false);
                                        if (selectedDate) {
                                            setloanEndDate(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <TextInput
                                label="Account Number"
                                mode="outlined"
                                value={accoutNumber}
                                onChangeText={text => {
                                    setaccoutNumber(text);
                                    if (text) setErrors(errors => ({ ...errors, accoutNumber: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.accoutNumber && (touched.accoutNumber || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.accoutNumber && (touched.accoutNumber || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, accoutNumber: true }))}
                            />
                            {!!errors.accoutNumber && (touched.accoutNumber || touched.submit) && (
                                <HelperText type="error" visible={!!errors.accoutNumber}>
                                    {errors.accoutNumber}
                                </HelperText>
                            )}

                            <TextInput
                                label="Notes"
                                mode="outlined"
                                value={loaNotes}
                                onChangeText={text => {
                                    setloaNotes(text);
                                    if (text) setErrors(errors => ({ ...errors, loaNotes: undefined }));
                                }}
                                multiline={true}
                                style={[styles.input, { minHeight: 150, textAlignVertical: 'top' }]}
                                activeOutlineColor={!!errors.loaNotes && (touched.loaNotes || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.loaNotes && (touched.loaNotes || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, loaNotes: true }))}
                            />
                            {!!errors.loaNotes && (touched.loaNotes || touched.submit) && (
                                <HelperText type="error" visible={!!errors.loaNotes}>
                                    {errors.loaNotes}
                                </HelperText>
                            )}
                        </View>
                    </View>
                )
            }

            {
                financialType == 'Lease' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <MaterialIcons name="account-balance" size={24} color="gray" />
                            </View>
                            <Text style={styles.sectionTitle}>Financial Type</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <TextInput
                                label="Vendor"
                                mode="outlined"
                                value={leaseVendor}
                                onChangeText={text => {
                                    setleaseVendor(text);
                                    if (text) setErrors(errors => ({ ...errors, leaseVendor: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.leaseVendor && (touched.leaseVendor || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.leaseVendor && (touched.leaseVendor || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, leaseVendor: true }))}
                            />
                            {!!errors.leaseVendor && (touched.leaseVendor || touched.submit) && (
                                <HelperText type="error" visible={!!errors.leaseVendor}>
                                    {errors.leaseVendor}
                                </HelperText>
                            )}

                            <TextInput
                                label="Date of Lease"
                                value={dateOfLease.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, End: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowDateOfLeasePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showDateOfLeasePicker && (
                                <RNDateTimePicker
                                    value={dateOfLease}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowDateOfLeasePicker(false);
                                        if (selectedDate) {
                                            setdateOfLease(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <TextInput
                                label="Capitalized Cost"
                                mode="outlined"
                                keyboardType="numeric"
                                value={capitalizedCost}
                                onChangeText={text => {
                                    setcapitalizedCost(text);
                                    if (text) setErrors(errors => ({ ...errors, capitalizedCost: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.capitalizedCost && (touched.capitalizedCost || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.capitalizedCost && (touched.capitalizedCost || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, capitalizedCost: true }))}
                                right={<TextInput.Icon icon="cash" forceTextInputFocus={false} />}
                            />
                            {!!errors.capitalizedCost && (touched.capitalizedCost || touched.submit) && (
                                <HelperText type="error" visible={!!errors.capitalizedCost}>
                                    {errors.capitalizedCost}
                                </HelperText>
                            )}

                            <TextInput
                                label="Down Payment"
                                mode="outlined"
                                keyboardType="numeric"
                                value={downPaymentLease}
                                onChangeText={text => {
                                    setdownPaymentLease(text);
                                    if (text) setErrors(errors => ({ ...errors, downPaymentLease: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.downPaymentLease && (touched.downPaymentLease || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.downPaymentLease && (touched.downPaymentLease || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, downPaymentLease: true }))}
                                right={<TextInput.Icon icon="cash" forceTextInputFocus={false} />}
                            />
                            {!!errors.downPaymentLease && (touched.downPaymentLease || touched.submit) && (
                                <HelperText type="error" visible={!!errors.downPaymentLease}>
                                    {errors.downPaymentLease}
                                </HelperText>
                            )}

                            <TextInput
                                label="First Payment Date"
                                value={firstPaymentDateLease.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, End: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowfirstPaymentDateLeasePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showfirstPaymentDateLeasePicker && (
                                <RNDateTimePicker
                                    value={firstPaymentDateLease}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowfirstPaymentDateLeasePicker(false);
                                        if (selectedDate) {
                                            setfirstPaymentDateLease(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <TextInput
                                label="Monthly Payment"
                                mode="outlined"
                                keyboardType="numeric"
                                value={montlyPaymentLease}
                                onChangeText={text => {
                                    setmontlyPaymentLease(text);
                                    if (text) setErrors(errors => ({ ...errors, montlyPaymentLease: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.montlyPaymentLease && (touched.montlyPaymentLease || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.montlyPaymentLease && (touched.montlyPaymentLease || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, montlyPaymentLease: true }))}
                                right={<TextInput.Icon icon="cash" forceTextInputFocus={false} />}
                            />
                            {!!errors.montlyPaymentLease && (touched.montlyPaymentLease || touched.submit) && (
                                <HelperText type="error" visible={!!errors.montlyPaymentLease}>
                                    {errors.montlyPaymentLease}
                                </HelperText>
                            )}

                            <TextInput
                                label="Number of Payments"
                                mode="outlined"
                                keyboardType="numeric"
                                value={numberOfPaymentsLease}
                                onChangeText={text => {
                                    setnumberOfPaymentsLease(text);
                                    if (text) setErrors(errors => ({ ...errors, numberOfPaymentsLease: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.numberOfPaymentsLease && (touched.numberOfPaymentsLease || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.numberOfPaymentsLease && (touched.numberOfPaymentsLease || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, numberOfPaymentsLease: true }))}
                            />
                            {!!errors.numberOfPaymentsLease && (touched.numberOfPaymentsLease || touched.submit) && (
                                <HelperText type="error" visible={!!errors.numberOfPaymentsLease}>
                                    {errors.numberOfPaymentsLease}
                                </HelperText>
                            )}

                            <TextInput
                                label="Lease End Date"
                                value={LeaseEndDate.toDateString()}
                                editable={false}
                                mode="outlined"
                                theme={inputTheme}
                                style={styles.input}
                                outlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#000'}
                                activeOutlineColor={!!errors.End && (touched.End || touched.submit) ? 'red' : '#0acf97'}
                                onBlur={() => setTouched(t => ({ ...t, End: true }))}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowLeaseEndDatePicker(true)} forceTextInputFocus={false} />}
                            />
                            {showLeaseEndDatePicker && (
                                <RNDateTimePicker
                                    value={LeaseEndDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowLeaseEndDatePicker(false);
                                        if (selectedDate) {
                                            setLeaseEndDate(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <TextInput
                                label="Residual Value"
                                mode="outlined"
                                keyboardType="numeric"
                                value={residualValue}
                                onChangeText={text => {
                                    setresidualValue(text);
                                    if (text) setErrors(errors => ({ ...errors, residualValue: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.residualValue && (touched.residualValue || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.residualValue && (touched.residualValue || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, residualValue: true }))}
                            />
                            {!!errors.residualValue && (touched.residualValue || touched.submit) && (
                                <HelperText type="error" visible={!!errors.residualValue}>
                                    {errors.residualValue}
                                </HelperText>
                            )}

                            <TextInput
                                label="Contract Mileage Cap"
                                mode="outlined"
                                keyboardType="numeric"
                                value={contractMileageCap}
                                onChangeText={text => {
                                    setcontractMileageCap(text);
                                    if (text) setErrors(errors => ({ ...errors, contractMileageCap: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.contractMileageCap && (touched.contractMileageCap || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.contractMileageCap && (touched.contractMileageCap || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, contractMileageCap: true }))}
                                right={<TextInput.Icon icon="map-marker-distance" forceTextInputFocus={false} />}
                            />
                            {!!errors.contractMileageCap && (touched.contractMileageCap || touched.submit) && (
                                <HelperText type="error" visible={!!errors.contractMileageCap}>
                                    {errors.contractMileageCap}
                                </HelperText>
                            )}

                            <TextInput
                                label="Excess Mileage Charge"
                                mode="outlined"
                                keyboardType="numeric"
                                value={excessMileageCharge}
                                onChangeText={text => {
                                    setexcessMileageCharge(text);
                                    if (text) setErrors(errors => ({ ...errors, excessMileageCharge: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.excessMileageCharge && (touched.excessMileageCharge || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.excessMileageCharge && (touched.excessMileageCharge || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, excessMileageCharge: true }))}
                                right={<TextInput.Icon icon="cash" forceTextInputFocus={false} />}
                            />
                            {!!errors.excessMileageCharge && (touched.excessMileageCharge || touched.submit) && (
                                <HelperText type="error" visible={!!errors.excessMileageCharge}>
                                    {errors.excessMileageCharge}
                                </HelperText>
                            )}

                            <TextInput
                                label="Lease Number"
                                mode="outlined"
                                value={leaseNumber}
                                onChangeText={text => {
                                    setleaseNumber(text);
                                    if (text) setErrors(errors => ({ ...errors, leaseNumber: undefined }));
                                }}
                                style={styles.input}
                                activeOutlineColor={!!errors.leaseNumber && (touched.leaseNumber || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.leaseNumber && (touched.leaseNumber || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, leaseNumber: true }))}
                            />
                            {!!errors.leaseNumber && (touched.leaseNumber || touched.submit) && (
                                <HelperText type="error" visible={!!errors.leaseNumber}>
                                    {errors.leaseNumber}
                                </HelperText>
                            )}

                            <TextInput
                                label="Notes"
                                mode="outlined"
                                value={leaseNotes}
                                multiline={true}
                                onChangeText={text => {
                                    setleaseNotes(text);
                                    if (text) setErrors(errors => ({ ...errors, leaseNotes: undefined }));
                                }}
                                style={[styles.input, { minHeight: 150 }]}
                                activeOutlineColor={!!errors.leaseNotes && (touched.leaseNotes || touched.submit) ? 'red' : '#0acf97'}
                                outlineColor={!!errors.leaseNotes && (touched.leaseNotes || touched.submit) ? 'red' : '#000'}
                                theme={inputTheme}
                                onBlur={() => setTouched(t => ({ ...t, leaseNotes: true }))}
                            />
                            {!!errors.leaseNotes && (touched.leaseNotes || touched.submit) && (
                                <HelperText type="error" visible={!!errors.leaseNotes}>
                                    {errors.leaseNotes}
                                </HelperText>
                            )}
                        </View>
                    </View>
                )
            }

            {/* Navigation Buttons */}
            <Button
                rippleColor={'green'}
                mode="contained"
                buttonColor='#0acf97'
                onPress={() => {
                    setTouched(t => ({ ...t, submit: true }));
                    onSubmit();
                }}
                style={styles.button}
                contentStyle={{ borderRadius: 8, paddingVertical: 6 }}
            >
                Save Asset
            </Button>
        </ScrollView>
    )
}

export default UpdateFinancialDetails;

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 16,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#0acf97',
    },
    sectionIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    sectionContent: {
        paddingVertical: 16,
        paddingHorizontal: 15,
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 4,
        borderRadius: 8,
    },
    button: {
        marginTop: 20,
        marginHorizontal: 23,
        borderRadius: 8,
    },
});