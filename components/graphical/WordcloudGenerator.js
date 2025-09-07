"use client";

import { useState } from "react";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

export default function WordcloudGenerator({
  width,
  height,
  showControls,
  data,
  rotation,
  typeOfSpiral
}) {
  const [spiralType, setSpiralType] = useState(typeOfSpiral);
  const [withRotation, setWithRotation] = useState(rotation);

  const colors = ["#143059", "#2F6B9A", "#82a6c2"];

  const fontSizeSetter = (datum) => fontScale(datum.value);

  const fixedValueGenerator = () => 0.5;

  const fontScale = scaleLog({
    domain: [
      Math.min(...data.map((w) => w.value)),
      Math.max(...data.map((w) => w.value)),
    ],
    range: [10, 100],
  });

  function getRotationDegree() {
    const rand = Math.random();
    const degree = rand > 0.5 ? 60 : -60;
    return rand * degree;
  }

  return (
    <div className="wordcloud">
      <Wordcloud
        words={data}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={"Impact"}
        padding={2}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
      {showControls && (
        <div>
          <label>
            Spiral type &nbsp;
            <select
              onChange={(e) => setSpiralType(e.target.value)}
              value={spiralType}
            >
              <option key={"archimedean"} value={"archimedean"}>
                archimedean
              </option>
              <option key={"rectangular"} value={"rectangular"}>
                rectangular
              </option>
            </select>
          </label>
          <label>
            With rotation &nbsp;
            <input
              type="checkbox"
              checked={withRotation}
              onChange={() => setWithRotation(!withRotation)}
            />
          </label>
          <br />
        </div>
      )}
      <style jsx>{`
        .wordcloud {
          display: flex;
          flex-direction: column;
          user-select: none;
        }
        .wordcloud svg {
          margin: 1rem 0;
          cursor: pointer;
        }

        .wordcloud label {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          margin-right: 8px;
        }
        .wordcloud textarea {
          min-height: 100px;
        }
      `}</style>
    </div>
  );
}
