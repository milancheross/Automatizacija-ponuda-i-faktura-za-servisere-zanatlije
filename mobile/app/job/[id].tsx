import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getJob, updateJob, Job, JobStatus } from '../../lib/api';

const STATUS_LABELS: Record<JobStatus, string> = {
  zakazano: 'Zakazano',
  u_toku: 'U toku',
  zavrseno: 'Završeno',
};

const STATUS_COLORS: Record<JobStatus, string> = {
  zakazano: '#2563EB',
  u_toku: '#f59e0b',
  zavrseno: '#059669',
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [editingNote, setEditingNote] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const data = await getJob(id);
      setJob(data);
      setNote(data.note || '');
    } catch (err: any) {
      Alert.alert('Greška', err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(status: JobStatus) {
    if (!job) return;
    setSaving(true);
    try {
      const updated = await updateJob(job.id, { status });
      setJob(updated);
    } catch (err: any) {
      Alert.alert('Greška', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!job) return;
    setSaving(true);
    try {
      const updated = await updateJob(job.id, { note });
      setJob(updated);
      setEditingNote(false);
    } catch (err: any) {
      Alert.alert('Greška', err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#2563EB" /></View>;
  if (!job) return null;

  const statusColor = STATUS_COLORS[job.status];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{job.title}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
          <Text style={[s.statusText, { color: statusColor }]}>{STATUS_LABELS[job.status]}</Text>
        </View>
      </View>

      {/* Client */}
      {job.clients && (
        <View style={s.card}>
          <Text style={s.cardLabel}>Klijent</Text>
          <Text style={s.cardValue}>{job.clients.name}</Text>
          {job.clients.phone && <Text style={s.cardSub}>{job.clients.phone}</Text>}
          {job.clients.address && <Text style={s.cardSub}>{job.clients.address}</Text>}
        </View>
      )}

      {/* Quote value */}
      {job.quotes && (
        <View style={s.card}>
          <Text style={s.cardLabel}>Vrednost posla</Text>
          <Text style={s.amount}>{Number(job.quotes.total_amount).toLocaleString('sr-RS')} RSD</Text>
        </View>
      )}

      {/* Status flow */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Promeni status</Text>
        <View style={s.statusRow}>
          {(['zakazano', 'u_toku', 'zavrseno'] as JobStatus[]).map(st => (
            <TouchableOpacity
              key={st}
              style={[
                s.statusBtn,
                job.status === st && { backgroundColor: STATUS_COLORS[st], borderColor: STATUS_COLORS[st] },
              ]}
              onPress={() => changeStatus(st)}
              disabled={job.status === st || saving}
            >
              <Text style={[s.statusBtnText, job.status === st && { color: '#fff' }]}>
                {STATUS_LABELS[st]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Note */}
      <View style={s.card}>
        <View style={s.noteHeader}>
          <Text style={s.cardLabel}>Napomena</Text>
          {!editingNote && (
            <TouchableOpacity onPress={() => setEditingNote(true)}>
              <Text style={s.editLink}>Uredi</Text>
            </TouchableOpacity>
          )}
        </View>
        {editingNote ? (
          <>
            <TextInput
              style={s.noteInput}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              placeholder="Dodaj napomenu o poslu..."
            />
            <View style={s.noteActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setNote(job.note || ''); setEditingNote(false); }}>
                <Text style={s.cancelBtnText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={saveNote} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Sačuvaj</Text>}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={s.noteText}>{job.note || 'Nema napomene.'}</Text>
        )}
      </View>

      {/* Dates */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Kreirano</Text>
        <Text style={s.cardSub}>{new Date(job.created_at).toLocaleDateString('sr-RS')}</Text>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a8a', marginBottom: 8 },
  statusBadge: {
    alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1.5,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  statusText: { fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 },
  cardValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  amount: { fontSize: 24, fontWeight: '800', color: '#059669' },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statusBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb',
    paddingVertical: 10, alignItems: 'center',
  },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editLink: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  noteText: { fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 4 },
  noteInput: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#111827', minHeight: 90,
    textAlignVertical: 'top', marginTop: 8,
  },
  noteActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  cancelBtnText: { color: '#6b7280', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
