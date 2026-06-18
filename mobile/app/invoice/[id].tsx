import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getInvoice, markPaid, Invoice, getClients, Client } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { printInvoice } from '../../lib/pdf';
import StatusBadge from '../../components/StatusBadge';
import QuoteItemRow from '../../components/QuoteItemRow';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);

  const loadInvoice = useCallback(async () => {
    try {
      const inv = await getInvoice(id);
      setInvoice(inv);
      if (inv.client) {
        setClient(inv.client);
      } else if (inv.client_id) {
        const clients = await getClients();
        setClient(clients.find(c => String(c.id) === String(inv.client_id)) || null);
      }
    } catch (err: any) {
      Alert.alert('Greška', err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { loadInvoice(); }, [loadInvoice]));

  async function handleMarkPaid() {
    if (!invoice) return;
    Alert.alert('Označi kao plaćeno', 'Da li je faktura plaćena?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Potvrdi', onPress: async () => {
          setMarkingPaid(true);
          try {
            const updated = await markPaid(invoice.id);
            setInvoice(prev => prev ? { ...prev, ...updated } : updated);
          } catch (err: any) {
            Alert.alert('Greška', err.message);
          } finally {
            setMarkingPaid(false);
          }
        },
      },
    ]);
  }

  async function handleSharePDF() {
    if (!invoice || !user) return;
    try {
      const invoiceWithClient = { ...invoice, client: client ?? invoice.client };
      await printInvoice(invoiceWithClient as any, user);
    } catch (err: any) {
      Alert.alert('Greška', 'Nije moguće generisati PDF: ' + err.message);
    }
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  if (!invoice) {
    return <View style={styles.centered}><Text style={styles.errorText}>Faktura nije pronađena</Text></View>;
  }

  const disc = invoice.discount_percent || 0;
  const total = invoice.total ?? 0;
  const subtotal = invoice.subtotal ?? total;
  const isPaid = invoice.status === 'placeno' || invoice.status === 'paid';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.invoiceLabel}>FAKTURA</Text>
              <Text style={styles.invoiceNum}>#{invoice.invoice_number}</Text>
            </View>
            <StatusBadge status={invoice.status} />
          </View>
          <Text style={styles.totalAmount}>{total.toLocaleString('sr-RS')} RSD</Text>
          <Text style={styles.headerDate}>
            Izdato: {new Date(invoice.issued_at).toLocaleDateString('sr-RS')}
            {invoice.due_at ? ` • Rok: ${new Date(invoice.due_at).toLocaleDateString('sr-RS')}` : ''}
          </Text>
          {invoice.paid_at && (
            <Text style={styles.paidText}>✓ Plaćeno: {new Date(invoice.paid_at).toLocaleDateString('sr-RS')}</Text>
          )}
        </View>

        {client && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Klijent</Text>
            <Text style={styles.clientName}>{client.name}</Text>
            {client.phone && <Text style={styles.clientDetail}>📞 {client.phone}</Text>}
            {client.email && <Text style={styles.clientDetail}>✉️ {client.email}</Text>}
            {client.address && <Text style={styles.clientDetail}>📍 {client.address}</Text>}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stavke</Text>
          {(invoice.items || []).map((item, idx) => (
            <QuoteItemRow key={idx} item={item} index={idx} readOnly />
          ))}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Osnovica:</Text>
              <Text style={styles.totalValue}>{subtotal.toLocaleString('sr-RS')} RSD</Text>
            </View>
            {disc > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#ef4444' }]}>Popust ({disc}%):</Text>
                <Text style={[styles.totalValue, { color: '#ef4444' }]}>
                  -{(subtotal * disc / 100).toLocaleString('sr-RS')} RSD
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>UKUPNO:</Text>
              <Text style={styles.grandTotalValue}>{total.toLocaleString('sr-RS')} RSD</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          {!isPaid && (
            <TouchableOpacity
              style={[styles.primaryBtn, markingPaid && styles.disabledBtn]}
              onPress={handleMarkPaid}
              disabled={markingPaid}
            >
              {markingPaid ? <ActivityIndicator color="#fff" size="small" /> :
                <Text style={styles.primaryBtnText}>✓ Označi kao plaćeno</Text>}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.pdfBtn} onPress={handleSharePDF}>
            <Text style={styles.pdfBtnText}>📄 Preuzmi / Podeli PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#9ca3af' },
  scroll: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: '#1e3a8a', borderRadius: 16, padding: 20, marginBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  invoiceLabel: { fontSize: 11, fontWeight: '700', color: '#93c5fd', letterSpacing: 1, marginBottom: 2 },
  invoiceNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  totalAmount: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerDate: { fontSize: 12, color: '#93c5fd' },
  paidText: { fontSize: 12, color: '#6ee7b7', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  clientDetail: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  totalsSection: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalValue: { fontSize: 14, color: '#374151', fontWeight: '600' },
  grandTotalRow: { paddingTop: 8, borderTopWidth: 2, borderTopColor: '#2563EB', marginTop: 4 },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: '#1e3a8a' },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
  actionsCard: { gap: 10 },
  primaryBtn: { backgroundColor: '#10b981', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pdfBtn: { backgroundColor: '#f0fdf4', borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#86efac' },
  pdfBtnText: { color: '#166534', fontSize: 15, fontWeight: '600' },
  disabledBtn: { opacity: 0.6 },
});
