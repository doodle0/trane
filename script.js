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
const INTERVAL_OPTIONS = [
    { note: 0, label: "완전1도" },
    { note: 1, label: "단2도" },
    { note: 2, label: "장2도" },
    { note: 3, label: "단3도" },
    { note: 4, label: "장3도" },
    { note: 5, label: "완전4도" },
    { note: 6, label: "증4도/감5도" },
    { note: 7, label: "완전5도" },
    { note: 8, label: "단6도" },
    { note: 9, label: "장6도" },
    { note: 10, label: "단7도" },
    { note: 11, label: "장7도" },
    { note: 12, label: "완전8도" }
];

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

    if (type == 'scaledeg') {
        settings.scaleEstab = $('#form-scaleEstab').val();
        settings.scaledegScope = $('#form-scaledegScope').val();
    } else if (type == 'interval') {
        settings.playOrder = $('#form-playOrder').val();
        settings.intervalScope = $('#form-intervalScope').val();
    }

    onProblemStart();
}

function onProblemStart() {
    $('#problem-area')
        .empty()
        .append($('<p class="card-text" id="problem-heading">'))
        .append($('<p class="card-text" id="ans-btn-group">'))
        .append($('<p class="card-text" id="ctl-btn-group">'));

    const problem = generateProblem();

    let heading, options;
    if (settings.type == 'scaledeg') {
        heading = "소리를 듣고 마지막으로 들린 음의 음도를 고르세요.";
        options = SCALEDEG_OPTIONS[settings.scaledegScope];
    } else if (settings.type == 'interval') {
        heading = "소리를 듣고 음정을 고르세요.";
        if (settings.intervalScope == 'easy') options = INTERVAL_OPTIONS.slice(0, 5);
        else if (settings.intervalScope == 'medium') options = INTERVAL_OPTIONS.slice(0, 8);
        else options = INTERVAL_OPTIONS;
    }

    $('#problem-heading').html(heading);

    options.forEach((opt, idx) => {
        $b = $(`<button type="button" class="btn btn-outline-dark me-1 mb-1" id="ans-${idx}">${opt.label}</button>`);
        $b.click((e) => {
            onAnswerClick(e);
        });
        if (idx == problem.ans) {
            $b.attr('ans', true);
        }
        $('#ans-btn-group').append($b);
    });

    $('#ctl-btn-group').append(
        $('<button type="button" class="btn btn-secondary me-1">다시 듣기</button>')
            .click(() => { playSequence(problem.sequence); })
    );

    playSequence(problem.sequence);
}

function generateProblem() {
    // 음도
    if (settings.type == 'scaledeg') {
        const ans = settings.scaledegScope == 'easy' ? randInt(8) :
            randInt(13);

        const beginNote = 48 + randInt(24);
        let seq, dur;
        if (settings.scaleEstab == 'up') [seq, dur] = majorScaleUp(beginNote, .250);
        else if (settings.scaleEstab == 'down') [seq, dur] = majorScaleDown(beginNote, .250);
        else if (settings.scaleEstab == 'up-down') [seq, dur] = majorScaleUpDown(beginNote, .250);
        else if (settings.scaleEstab == 'triads') [seq, dur] = majorTriads(beginNote, .500);
        else[seq, dur] = [[{ nt: beginNote, st: 0, du: .500 }], .500];

        seq[seq.length] = {
            nt: beginNote + SCALEDEG_OPTIONS[settings.scaledegScope][ans].note,
            st: dur + .250, du: 1.000
        };

        return { sequence: seq, ans: ans };
    }

    // 음정
    if (settings.type == 'interval') {
        const ans =
            settings.intervalScope == 'easy' ? randInt(5) :
                settings.intervalScope == 'medium' ? randInt(8) :
                    randInt(13);
        const lowNote = 48 + randInt(24);

        let seq;
        if (settings.playOrder == 'up')
            seq = [{ nt: lowNote, st: 0, du: .500 }, { nt: lowNote + ans, st: .500, du: .500 }];
        else if (settings.playOrder == 'down')
            seq = [{ nt: lowNote + ans, st: 0, du: .500 }, { nt: lowNote, st: .500, du: .500 }];
        else if (settings.playOrder == 'simul')
            seq = [{ nt: lowNote, st: 0, du: 1.000 }, { nt: lowNote + ans, st: 0, du: 1.000 }];

        return { sequence: seq, ans: ans };
    }
}

function onAnswerClick(e) {
    if ($(e.target).attr('ans')) {
        $(e.target).removeClass('btn-outline-dark');
        $(e.target).addClass('btn-success');
        $('#problem-heading').html('<strong>정답입니다!<strong>');

        // 다음 문제 버튼 추가
        if ($('#ctl-btn-group').children().filter('#next-prob').length == 0) {
            $('#ctl-btn-group').append(
                $('<button type="button" class="btn btn-primary me-1" id="next-prob">다음 문제</button>')
                    .click(() => { onProblemStart(); })
            );
        }
    } else {
        $(e.target).removeClass('btn-outline-dark');
        $(e.target).addClass('btn-danger');
    }
}

$('#btn-start-scaledeg').click(() => {
    onSessionStart('scaledeg');
});
$('#btn-start-interval').click(() => {
    onSessionStart('interval');
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