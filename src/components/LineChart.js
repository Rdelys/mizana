// Courbe simple dessinée avec des View (aucune bibliothèque de graphiques).
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';

export default function LineChart({ data, goal, height = 180, color = colors.primary }) {
  const [width, setWidth] = useState(0);

  if (!data || data.length === 0) return null;

  const padL = 38;
  const padR = 14;
  const padT = 14;
  const padB = 26;

  const values = data.map((d) => d.value);
  const all = goal !== undefined && goal !== null ? [...values, goal] : values;
  let min = Math.min(...all);
  let max = Math.max(...all);
  const span = Math.max(max - min, 1);
  min -= span * 0.12;
  max += span * 0.12;

  const innerW = Math.max(0, width - padL - padR);
  const innerH = height - padT - padB;
  const x = (i) => padL + (data.length === 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
  const y = (v) => padT + innerH * (1 - (v - min) / (max - min));

  const segments = [];
  for (let i = 0; i < data.length - 1; i += 1) {
    const x1 = x(i);
    const y1 = y(data[i].value);
    const x2 = x(i + 1);
    const y2 = y(data[i + 1].value);
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    segments.push({
      key: `s${i}`,
      left: (x1 + x2) / 2 - len / 2,
      top: (y1 + y2) / 2 - 1.5,
      width: len,
      angle,
    });
  }

  const showAllLabels = data.length <= 6;

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          {/* Ligne d'objectif */}
          {goal !== undefined && goal !== null && (
            <>
              <View
                style={{
                  position: 'absolute',
                  left: padL,
                  width: innerW,
                  top: y(goal),
                  height: 1.5,
                  backgroundColor: colors.accent,
                  opacity: 0.7,
                }}
              />
              <Text
                style={{
                  position: 'absolute',
                  right: padR,
                  top: y(goal) - 16,
                  fontSize: 11,
                  color: colors.accent,
                  fontWeight: '700',
                }}
              >
                Objectif {String(goal).replace('.', ',')}
              </Text>
            </>
          )}

          {/* Repères verticaux */}
          <Text style={{ position: 'absolute', left: 0, top: padT - 7, width: padL - 6, textAlign: 'right', fontSize: 10, color: colors.muted }}>
            {Math.round(max)}
          </Text>
          <Text style={{ position: 'absolute', left: 0, top: padT + innerH - 7, width: padL - 6, textAlign: 'right', fontSize: 10, color: colors.muted }}>
            {Math.round(min)}
          </Text>

          {/* Segments */}
          {segments.map((s) => (
            <View
              key={s.key}
              style={{
                position: 'absolute',
                left: s.left,
                top: s.top,
                width: s.width,
                height: 3,
                borderRadius: 2,
                backgroundColor: color,
                transform: [{ rotate: `${s.angle}rad` }],
              }}
            />
          ))}

          {/* Points et valeurs */}
          {data.map((d, i) => (
            <React.Fragment key={`p${i}`}>
              <View
                style={{
                  position: 'absolute',
                  left: x(i) - 5,
                  top: y(d.value) - 5,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 2.5,
                  borderColor: color,
                }}
              />
              {(showAllLabels || i === data.length - 1) && (
                <Text
                  style={{
                    position: 'absolute',
                    left: x(i) - 22,
                    width: 44,
                    textAlign: 'center',
                    top: y(d.value) - 22,
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.text,
                  }}
                >
                  {String(d.value).replace('.', ',')}
                </Text>
              )}
              {(showAllLabels || i === 0 || i === data.length - 1) && (
                <Text
                  style={{
                    position: 'absolute',
                    left: x(i) - 24,
                    width: 48,
                    textAlign: 'center',
                    top: height - padB + 8,
                    fontSize: 10,
                    color: colors.muted,
                  }}
                >
                  {d.label}
                </Text>
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </View>
  );
}
