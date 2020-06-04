var express = require("express");
var router = express.Router();
const puppteer = require("puppeteer");
const Axios = require("axios");

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { title: "Express" });
});

router.get("/exchange", function (req, res, next) {
	const rennigouPromise = async () => {
		const browser = await puppteer.launch({
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"–disable-gpu",
				"–disable-dev-shm-usage",
				"–disable-setuid-sandbox",
				"–no-first-run",
				"–no-sandbox",
				"–no-zygote",
			],
			headless: true,
		});
		const page1 = await browser.newPage();
		await page1.goto("https://rennigou.jp", {
			timeout: 0,
		});

		//rennigou
		const poi = await page1.evaluate(() => {
			return {
				poi: window.poi,
			};
		});
		console.log("任你购汇率: " + poi.poi.exchange);

		await browser.close();

		return poi.poi.exchange;
	};

	const hoyoyoPromise = async () => {
		const browser = await puppteer.launch({
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"–disable-gpu",
				"–disable-dev-shm-usage",
				"–disable-setuid-sandbox",
				"–no-first-run",
				"–no-sandbox",
				"–no-zygote",
			],
			headless: true,
		});

		const page2 = await browser.newPage();
		await page2.goto("http://cn.hoyoyo.com/", {
			timeout: 0,
		});

		//hoyoyo
		const content = await page2.content();
		const hoyoyoRegex = new RegExp(
			"(?<=(var member_exchange_rate = ')).*(\\d)"
		);
		const member_exchange_rate = hoyoyoRegex.exec(content);
		console.log("hoyoyo汇率: " + member_exchange_rate[0]);

		await browser.close();

		return member_exchange_rate[0];
	};

	const rigouwangPromise = async () => {
		const browser = await puppteer.launch({
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"–disable-gpu",
				"–disable-dev-shm-usage",
				"–disable-setuid-sandbox",
				"–no-first-run",
				"–no-sandbox",
				"–no-zygote",
			],
			headless: true,
		});
		const page3 = await browser.newPage();
		await page3.goto("http://www.rigouwang.com/Question/about", {
			timeout: 0,
		});

		// rigouwang
		const rateString = await page3.evaluate(() => {
			return document.getElementsByClassName("rate")[0].innerText;
		});
		const rigouwangRegex = new RegExp("(?<=( = )).*( )");
		const rigouwangResult = rigouwangRegex.exec(rateString);
		const rigouwangExchangeRate = parseFloat(rigouwangResult[0]) / 100;
		console.log("日购网汇率: " + rigouwangExchangeRate);

		await browser.close();

		return rigouwangExchangeRate;
	};

	const masaPromise = async () => {
		const response = await Axios.get(
			"http://www.masadora.jp/util/exchangeRate.json"
		);

		console.log("玛沙汇率: " + response.data.jpyRate);

		return response.data.jpyRate;
	};

	const getResult = async () => {
		// const rennigou = await rennigouPromise();
		// const hoyoyo = await hoyoyoPromise();
		// const rigouwang = await rigouwangPromise();
		// const masa = await masaPromise();
		const test = await Promise.all([
			rennigouPromise(),
			hoyoyoPromise(),
			rigouwangPromise(),
			masaPromise(),
		]);
		console.log(test);
		res.json({
			rennigou: test[0],
			hoyoyo: Number(test[1]),
			rigouwang: test[2],
			masadora: Number(test[3]),
		});
	};

	getResult();

	// Promise.all([rennigouPromise, hoyoyoPromise, rigouwangPromise, masaPromise])
	// 	.then(([rennigou, hoyoyo, rigouwang, masa]) => {
	// 		console.log(11111111);

	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		res.json({
	// 			error: "爬取失败",
	// 		});
	// 	});
});

module.exports = router;
