const apiURL = 'https://jservice.io/api/';
const numCategories = 6;
const numQuestionsPerCat = 5;

let categories = [];
let catIdArr = [];
let catTitle = [];

async function getCategoryIds() {
	const res = await axios.get(`${apiURL}categories?count=100`);
	const ids = res.data.map((id) => id.id);
	for (let i = 0; i < numCategories; i++) {
		catIdArr.push(ids[Math.floor(Math.random() * ids.length + 1)]);
		categories.push(ids[Math.floor(Math.random() * ids.length + 1)]);
	}
}
let catQuestions = [];
async function getCatInfo(id) {
	const res = await axios.get(`${apiURL}category?id=${id}`);
	let clueArr = [];
	for (let i = 0; i < 5; i++) {
		let obj = {
			question : res.data.clues[i].question,
			answer   : res.data.clues[i].answer,
			showing  : null
		};
		clueArr.push(obj);
	}
	catTitle.push(res.data.title);
	catQuestions.push({ clueArr });
	return { title: res.data.title, clueArr };
}

async function getCategory(catId) {
	return catIdArr.forEach((id) => getCatInfo(id));
}

async function fillTable() {
	$('#jeopardy thead').empty();
	let $tr = $('<tr>');
	for (let i = 0; i < numCategories; i++) {
		$tr.append($('<th>').text(catTitle[i]));
	}
	$('#jeopardy thead').append($tr);
	$('#jeopardy tbody').empty();
	for (let j = 0; j < numQuestionsPerCat; j++) {
		let tr = $('<tr>');
		for (let k = 0; k < numCategories; k++) {
			tr.append($('<td>').attr('id', `${k}-${j}`).text('?'));
		}
		$('#jeopardy thead').append(tr);
	}
}
function handleClick(evt) {
	let id = evt.target.id;
	let [ catId, clueId ] = id.split('-');
	let clue = catQuestions[catId].clueArr[clueId];
	let msg;
	if (!clue.showing) {
		msg = clue.question;
		clue.showing = 'ques';
	} else if (clue.showing === 'ques') {
		msg = clue.answer;
		clue.showing = 'ans';
	} else {
		return;
	}
	$(`#${catId}-${clueId}`).html(msg);
}

function showLoadingView() {}
function hideLoadingView() {}

async function setupAndStart() {
	await getCategoryIds();
	await getCategory();
	setTimeout('fillTable()', 500);
}
$(async function() {
	setupAndStart();
	fillTable();
	$('#jeopardy').on('click', 'td', handleClick);
});

function restart() {
	categories = [];
	catIdArr = [];
	catTitle = [];
	catQuestions = [];
	setupAndStart();
}
$('#restart').on('click', restart);
