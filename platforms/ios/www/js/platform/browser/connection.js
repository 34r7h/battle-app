if(navigator.connection === undefined || Connection !== undefined) {
	var Connection = window.connection = {
		CELL_2G: "2g",
		CELL_3G: "3g",
		CELL_4G: "4g",
		ETHERNET: "ethernet",
		NONE: "none",
		UNKNOWN: "unknown",
		WIFI: "wifi"
	};

	navigator.connection = {};
	navigator.connection.type = Connection.ETHERNET;
}