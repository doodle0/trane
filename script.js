const SCALEDEG_OPTIONS = {
    easy: [
        { note: 0, label: "1" },
        { note: 2, label: "2" },
        { note: 4, label: "3" },
        { note: 5, label: "4" },
        { note: 7, label: "5" },
        { note: 9, label: "6" },
        { note: 11, label: "7" },
        { note: 12, label: "8" }
    ],
    hard: [
        { note: 0, label: "1" },
        { note: 1, label: "#1/b2" },
        { note: 2, label: "2" },
        { note: 3, label: "#2/b3" },
        { note: 4, label: "3" },
        { note: 5, label: "4" },
        { note: 6, label: "#4/b5" },
        { note: 7, label: "5" },
        { note: 8, label: "#5/b6" },
        { note: 9, label: "6" },
        { note: 10, label: "#6/b7" },
        { note: 11, label: "7" },
        { note: 12, label: "8" }
    ]
};

const MAJOR_SCALE_NOTES = [0, 2, 4, 5, 7, 9, 11, 12];
const MAJOR_TRIAD_NOTES = [0, 4, 7];

var settings = {};

function randInt(n) {
    return Math.floor(Math.random() * n)
}

function playSequence(sequence) {
    for (let event of sequence) {
        MIDI.noteOn(0, event.nt, 127, event.st);
        MIDI.noteOff(0, event.nt, event.st + event.du);
    }
}

function majorScaleUp(begin, dur) {
    let result = [];
    for (let i in MAJOR_SCALE_NOTES) {
        result[i] = { nt: begin + MAJOR_SCALE_NOTES[i], st: dur * i, du: dur };
    }
    return [result, dur * 8];
}
function majorScaleDown(begin, dur) {
    let result = [];
    for (let i in MAJOR_SCALE_NOTES) {
        result[i] = { nt: begin + MAJOR_SCALE_NOTES[7 - i], st: dur * i, du: dur };
    }
    return [result, dur * 8];
}
function majorScaleUpDown(begin, dur) {
    let result = [];
    for (let i in MAJOR_SCALE_NOTES) {
        result[i] = { nt: begin + MAJOR_SCALE_NOTES[i], st: dur * i, du: dur };
    }
    for (let i = 8; i < 15; i++) {
        result[i] = { nt: begin + MAJOR_SCALE_NOTES[14 - i], st: dur * i, du: dur };
    }
    return [result, dur * 15];
}
function majorTriads(begin, dur) {
    result = []
    const roots = [0, 5, 7, 0];
    roots.forEach((root, i) => {
        for (let nt of MAJOR_TRIAD_NOTES) {
            result[result.length] = { nt: begin + root + nt, st: dur * i, du: dur };
        }
    });
    return [result, dur * 4];
}

function onSessionStart(type) {
    settings = { type: type };

    if (type == "scaledeg") {
        settings.scaleEstab = $('#form-scaleEstab').val();
        settings.scaledegType = $('#form-scaledegType').val();
    }

    onProblemStart();
}

function onProblemStart() {
    const $probArea = $('#problem-area');
    $probArea.empty();

    let problem;

    // 음도
    if (settings.type == 'scaledeg') {
        problem = generateProblem();

        $probArea.append('<p class="card-text" id="problem-heading">소리를 듣고 올바른 음도를 고르세요.');
        $probArea.append($('<div id="ans-btn-group">'));
        SCALEDEG_OPTIONS[settings.scaledegType].forEach((opt, idx) => {
            $b = $(`<button type="button" class="btn btn-outline-dark m-1" id="ans-${idx}">${opt.label}</button>`)
            $b.click((e) => {
                onAnswerClick(e);
            })
            if (idx == problem.ans) {
                $b.attr('ans', true);
            }
            $('#ans-btn-group').append($b);
        });
        $probArea.append(
            $('<button type="button" class="btn btn-secondary my-2" id="replay">다시 듣기</button>')
                .click(() => { playSequence(problem.sequence); })
        );
    }

    playSequence(problem.sequence);
}

function generateProblem() {
    if (settings.type == 'scaledeg') {
        let ans;
        if (settings.scaledegType == 'easy') ans = randInt(8);
        else ans = randInt(13);

        const beginNote = 48 + randInt(24);
        let seq, dur;
        if (settings.scaleEstab == 'up') [seq, dur] = majorScaleUp(beginNote, .250);
        else if (settings.scaleEstab == 'down') [seq, dur] = majorScaleDown(beginNote, .250);
        else if (settings.scaleEstab == 'up-down') [seq, dur] = majorScaleUpDown(beginNote, .250);
        else if (settings.scaleEstab == 'triads') [seq, dur] = majorTriads(beginNote, .500);
        else[seq, dur] = [[{ nt: beginNote, st: 0, du: .500 }], .500];

        seq[seq.length] = {
            nt: beginNote + SCALEDEG_OPTIONS[settings.scaledegType][ans].note,
            st: dur + .250, du: 1.000
        };

        return { sequence: seq, ans: ans };
    }
}

function onAnswerClick(e) {
    if ($(e.target).attr('ans')) {
        $(e.target).removeClass('btn-outline-dark');
        $(e.target).addClass('btn-success');
        $('#problem-heading').html('<strong>정답입니다!<strong>');
        $('#problem-area').append(
            $('<button type="button" class="btn btn-primary mx-2" id="next-prob">다음 문제</button>')
                .click(() => { onProblemStart(); })
        );
    } else {
        $(e.target).removeClass('btn-outline-dark');
        $(e.target).addClass('btn-danger');
    }
}

$('#btn-start-scaledeg').click(() => {
    onSessionStart('scaledeg');
});

$('.nav-item').click(() => {
    $('#problem-area').html("&ldquo;시작하기&rdquo; 버튼을 누르면 여기에 문제가 표시됩니다.");
});

$(() => {
    MIDI.loadPlugin({
      soundfontUrl: "./soundfont/",
      instrument: "acoustic_grand_piano",
      onprogress: function (state, progress) {
        console.log(state, progress);
      }
    });
});