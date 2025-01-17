DATA = {
    'scaledeg': {
        options: [
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
        ],
        scopes: {
            easy: [0, 2, 4, 5, 7, 9, 11, 12],
            hard: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
    },
    'interval': {
        options: [
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
        ],
        scopes: {
            easy: [0, 1, 2, 3, 4],
            medium: [0, 1, 2, 3, 4, 5, 6, 7],
            hard: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
    },
    'triad': {
        options: [
            { note: [0, 4, 7], label: "메이저" },
            { note: [0, 3, 8], label: "메이저 (1전위)" },
            { note: [0, 5, 9], label: "메이저 (2전위)" },
            { note: [0, 3, 7], label: "마이너" },
            { note: [0, 4, 9], label: "마이너 (1전위)" },
            { note: [0, 5, 8], label: "마이너 (2전위)" },
            { note: [0, 4, 8], label: "어그멘티드" },
            { note: [0, 3, 6], label: "디미니시드" },
        ],
        scopes: {
            'maj-min-default': [0, 3],
            'maj-min-1st': [1, 4],
            'maj-min-2nd': [2, 5],
            'maj-min-all': [0, 1, 2, 3, 4, 5],
            'aug-dim': [6, 7],
            'all': [0, 3, 6, 7]
        }
    },
    'seventh': {
        options: [
            { note: [0, 4, 7, 11], label: "메이저 7" },
            { note: [0, 3, 7, 10], label: "마이너 7" },
            { note: [0, 4, 7, 10], label: "도미넌트 7" },
            { note: [0, 3, 6, 9], label: "디미니시드 7" },
            { note: [0, 3, 6, 10], label: "하프 디미니시드 7" },
        ]
    }
};

const MAJOR_SCALE_NOTES = [0, 2, 4, 5, 7, 9, 11, 12];


var settings = {};

function randInt(n) {
    return Math.floor(Math.random() * n)
}

function getProblemHeading() {
    return {
        'scaledeg': () => {
            let what = "스케일이";
            if (settings.scaleEstab == 'triads') what = "스케일의 주요 3화음이";
            else if (settings.scaleEstab == 'first-deg') what = "스케일의 1도음이"
            return `${what} 재생된 이후 음이 하나 재생됩니다. 소리를 듣고 마지막으로 들린 음의 음도를 고르세요.`;
        },
        'interval': () => "소리를 듣고 음정을 고르세요.",
        'triad': () => "소리를 듣고 3화음의 종류를 고르세요."
    }[settings.trainingType];
};

function getCurrentScope() {
    if (settings.trainingType == 'triad' && settings.scope == 'maj-min') {
        return DATA.triad.scopes['maj-min-' + settings.triadInversion];
    }
    return DATA[settings.trainingType].scopes[settings.scope]
}

const generateProblem = {
    // 음도
    'scaledeg': (scope) => {
        const baseNote = 48 + randInt(24);
        const ans = randInt(scope.length);

        const [seq, dur] = {
            'up': () => arpeggioUp(MAJOR_SCALE_NOTES, baseNote, .250),
            'down': () => arpeggioDown(MAJOR_SCALE_NOTES, baseNote, .250),
            'up-down': () => arpeggioUpDown(MAJOR_SCALE_NOTES, baseNote, .250),
            'triads': () => majorTriads(baseNote, .500),
            'first-deg': () => [[{ nt: baseNote, st: 0, du: .500 }], .500]
        }[settings.scaleEstab]();

        seq[seq.length] = {
            nt: baseNote + DATA.scaledeg.options[scope[ans]].note,
            st: dur + .250, du: 1.000
        };

        return { sequence: seq, ans: ans };
    },

    // 음정
    'interval': (scope) => {
        const baseNote = 48 + randInt(24);
        const ans = randInt(scope.length);

        const [seq, _] = {
            'up': () => arpeggioUp([0, ans], baseNote, .500),
            'down': () => arpeggioDown([0, ans], baseNote, .500),
            'simul': () => chord([0, ans], baseNote, 0, 1.000)
        }[settings.intervalPlayOrder]();

        return { sequence: seq, ans: ans };
    },

    // 3화음
    'triad': (scope) => {
        const baseNote = 48 + randInt(24);
        const ans = randInt(scope.length);

        const chordToPlay = DATA.triad.options[scope[ans]].note;

        const [seq, _] = {
            'up': () => arpeggioUp(chordToPlay, baseNote, .500),
            'down': () => arpeggioDown(chordToPlay, baseNote, .500),
            'simul': () => chord(chordToPlay, baseNote, 0, 1.000)
        }[settings.triadPlayOrder]();

        return { sequence: seq, ans: ans };
    }
};

function generateOptions(scope) {
    const options = DATA[settings.trainingType].options;
    return scope.map(i => options[i]);
};

function onTrainingStart(type) {
    settings = { trainingType: type };

    const $settingsFields = $(`#${type}-tab-pane select`);
    for (let s of $settingsFields) {
        const fieldName = s.id.slice(5);  // Remove "form-"
        settings[fieldName] = $(s).val();
        if (fieldName.endsWith('Scope')) {
            settings.scope = settings[fieldName];
        }
    }

    onProblemStart();
}

function onProblemStart() {
    // Add DOM for card layout
    $('#problem-area')
        .empty()
        .append($('<p class="card-text" id="problem-heading">'))
        .append($('<p class="card-text" id="ans-btn-group">'))
        .append($('<p class="card-text" id="ctl-btn-group">'));
    $('#problem-heading').html(getProblemHeading());

    $('#ctl-btn-group').append(
        $('<button type="button" class="btn btn-secondary me-1">다시 듣기</button>')
            .click(() => { playSequence(problem.sequence); })
    );

    // Generate problem & options
    const currentScope = getCurrentScope();
    const problem = generateProblem[settings.trainingType](currentScope);
    const options = generateOptions(currentScope);

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

    // Play the sequence
    playSequence(problem.sequence);
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
    onTrainingStart('scaledeg');
});
$('#btn-start-interval').click(() => {
    onTrainingStart('interval');
});
$('#btn-start-triad').click(() => {
    onTrainingStart('triad');
});
$('#form-triadScope').change(() => {
    if ($('#form-triadScope').val() == 'maj-min') {
        $('#form-triadInversion').parent().removeClass('d-none');
    } else {
        $('#form-triadInversion').parent().addClass('d-none');
    }
});

$('.nav-item').click(() => {
    $('#problem-area').html("&ldquo;시작하기&rdquo; 버튼을 누르면 여기에 문제가 표시됩니다.");
});
