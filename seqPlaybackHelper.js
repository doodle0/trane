function playSequence(sequence) {
    for (let event of sequence) {
        MIDI.noteOn(0, event.nt, 127, event.st);
        MIDI.noteOff(0, event.nt, event.st + event.du);
    }
}

function arpeggioUp(notes, noteOffset, noteDur) {
    const numNotes = notes.length;
    let result = [];
    for (let i in notes) {
        result[i] = { nt: noteOffset + notes[i], st: noteDur * i, du: noteDur };
    }
    return [result, noteDur * numNotes];
}
function arpeggioDown(notes, noteOffset, noteDur) {
    const numNotes = notes.length;
    let result = [];
    for (let i in notes) {
        result[i] = { nt: noteOffset + notes[numNotes - 1 - i], st: noteDur * i, du: noteDur };
    }
    return [result, noteDur * numNotes];
}
function arpeggioUpDown(notes, noteOffset, dur) {
    const numNotes = notes.length;
    let result = [];
    for (let i in notes) {
        result[i] = { nt: noteOffset + notes[i], st: dur * i, du: dur };
    }
    for (let i = numNotes; i < 2 * numNotes - 1; i++) {
        result[i] = { nt: noteOffset + notes[2 * numNotes - 2 - i], st: dur * i, du: dur };
    }
    return [result, dur * (2 * numNotes - 1)];
}
function chord(notes, noteOffset, st, dur) {
    let result = [];
    for (let i in notes) {
        result[i] = { nt: noteOffset + notes[i], st: st, du: dur };
    }
    return [result, dur];
}

function majorTriads(begin, dur) {
    const MAJOR_TRIAD_NOTES = [0, 4, 7];
    const ROOTS = [0, 5, 7, 0];

    let result = []
    ROOTS.forEach((root, i) => {
        const [ch, _] = chord(MAJOR_TRIAD_NOTES, begin + root, dur * i, dur);
        result = result.concat(ch);
    });
    return [result, dur * 4];
}

$(() => {
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function (state, progress) {
            console.log(state, progress);
        }
    });
});
