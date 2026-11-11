import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { EXERCISES } from '../data/exercises';
import ExerciseVisual from './ExerciseVisual';
import { Button, Icon, Muted, Notice } from './UI';

// reps / sets : objectif du jour (facultatif, absent des anciens programmes IA)
export default function ExerciseGuide({ id, reps, sets, onClose }) {
  const ex = id ? EXERCISES[id] : null;
  const name = ex ? ex.name.toLowerCase() : '';

  let goal = null;
  let example = null;
  if (ex && (reps || sets)) {
    if (reps) {
      goal = `${reps} répétitions${sets ? ` × ${sets} séries` : ''}`;
      example = `Exemple : faites ${reps} ${name}, reposez-vous, puis recommencez${sets ? ` : ${sets} séries au total` : ''}. Si c’est trop dur, arrêtez-vous 1 ou 2 répétitions avant la limite.`;
    } else {
      goal = `Position tenue${sets ? ` × ${sets} séries` : ''}`;
      example = `Exemple : tenez la position pendant le temps indiqué par le minuteur, reposez-vous, puis recommencez${sets ? ` : ${sets} séries au total` : ''}.`;
    }
  }

  return (
    <Modal visible={!!ex} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {ex ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <ExerciseVisual id={id} size={150} tone="dark" />
              </View>
              <Text style={styles.name}>{ex.name}</Text>
              <Muted style={{ textAlign: 'center', marginBottom: 14 }}>Muscles travaillés : {ex.muscles}</Muted>

              {goal ? (
                <View style={styles.goalBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="bullseye" size={14} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.goalTitle}>Objectif du jour : {goal}</Text>
                  </View>
                  <Text style={styles.goalText}>{example}</Text>
                </View>
              ) : null}

              {ex.steps.map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}

              <Notice tone="warn" style={{ marginTop: 8 }}>
                À éviter : {ex.mistake}
              </Notice>
              <Button title="Fermer" variant="secondary" onPress={onClose} />
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,31,92,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    maxHeight: '88%',
  },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  goalBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  goalTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  goalText: { fontSize: 14, lineHeight: 20, color: colors.text, marginTop: 6 },
  stepRow: { flexDirection: 'row', marginBottom: 10 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.text },
});