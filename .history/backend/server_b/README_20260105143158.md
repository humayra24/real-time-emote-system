# Server B

This directory is for the code of the _server B_. A starter Dockerfile has been added, it has some comments to get you started.

Server B consumes the _raw-emote-data_ topic and produces the _aggregated-emote-data_ topic. It should also expose a REST API for managing aggregation settings.

To get started you should run `npm init` in this directory to initialize the Node project. This will create a `package.json`-file, which is used to define the project's attributes, dependencies etc. You should next create the index.js file.

## Aggregation

This is a simplistic approach to aggregation. Feel free to implement a more elegant solution, but keep in mind, that the point of this exercise is not to desing pretty data mining systems.

In this approach, raw emote data topic is consumed and whenever a certain amount of messages (n=100) is collected, they (that chunk) are analyzed for significant moments.

```
const analyzeEmotes = async emoteData => {
    const significantMoments = [];
    const emoteCounts = {};

    emoteData.forEach(record => {
        const timestamp = record.timestamp.slice(0, 16); // Minute-level granularity
        const emote = record.emote;

        if (!emoteCounts[timestamp]) {
            emoteCounts[timestamp] = { total: 0 };
        }

        if (!emoteCounts[timestamp][emote]) {
            emoteCounts[timestamp][emote] = 0;
        }

        emoteCounts[timestamp][emote]++;
        emoteCounts[timestamp].total++;
    });

    for (const timestamp in emoteCounts) {
        const counts = emoteCounts[timestamp];
        const totalEmotes = counts.total;

        for (const emote in counts) {
            if (emote !== 'total' && counts[emote] / totalEmotes > threshold) {
                significantMoments.push({
                    timestamp,
                    emote,
                    count: counts[emote],
                    totalEmotes
                });
            }
        }
    }

    return significantMoments;
};
```
