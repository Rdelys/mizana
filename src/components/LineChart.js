// Courbe simple dessinée avec des View (aucune bibliothèque de graphiques).
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';

export default function LineChart({ data, goal, height = 190, color = colors.primary }) {
  const [width, setWidth] = useState(0);

  if (!data || data.length === 0) return null;

  const padL = 38;
  const padR = 14;
  const padT = 16;
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
  const gridLines = [0, 0.5, 1].map((t) => padT + innerH * t);

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          {/* Repères horizontaux */}
          {gridLines.map((top, i) => (
            <View
              key={`g${i}`}
              style={{ position: 'absolute', left: padL, width: innerW, top, height: 1, backgroundColor: colors.border }}
            />
          ))}

          {/* Ligne d'objectif */}
          {goal !== undefined && goal !== null && (
            <>
              <View
                style={{
                  position: 'absolute',
                  left: padL,
                  width: innerW,
                  top: y(goal),
                  height: 2,
                  backgroundColor: colors.accent,
                  opacity: 0.85,
                }}
              />
              <Text
                style={{
                  position: 'absolute',
                  right: padR,
                  top: y(goal) - 17,
                  fontSize: 11,
                  color: colors.accent,
                  fontWeight: '800',
                }}
              >
                Objectif {String(goal).replace('.', ',')}
              </Text>
            </>
          )}

          {/* Valeurs de l'axe vertical */}
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
                height: 4,
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
                  left: x(i) - 6,
                  top: y(d.value) - 6,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 3,
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
                    top: y(d.value) - 24,
                    fontSize: 12,
                    fontWeight: '800',
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