"use strict";
const faker = require("@faker-js/faker/locale/id_ID");

const path = require("path");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");

const device = new escpos.USB();
const options = { encoding: "GB18030" };
const printer = new escpos.Printer(device, options);

var bodyParser = require("body-parser");
var app = require("express")();
var http = require("http").Server(app);
var cors = require("cors");
app.use(cors());
app.use(bodyParser.json());

const port = 4000;

http.listen(port, () => {
  console.log(`Printer: http://localhost:${port}`);
});

app.post("/printStruck", (req, res) => {
  res.json({ status: "success" });
  let response = req.body;
  printStruck(
    response.carts,
    response.subTotal,
    response.pajak,
    response.diskon,
    response.total,
    response.bayar,
    response.kembalian,
    response.tanggal,
    response.noTransaksi,
    response.kasir,
    response.customer,
    response.agency
  );
  throw new Error("BROKEN");
});

app.post("/printSummary", (req, res) => {
  res.json({ status: "success" });
  // console.log(req.body);
  // console.log(device);
  let response = req.body;

  // console.log(response);
  printSummary();
});

app.post("/printShiftReport", (req, res) => {
  res.json({ status: "success" });
  // console.log(req.body);
  // console.log(device);
  let response = req.body;

  // console.log(response);
  printShiftReport();
});

app.post("/printSalesSummary", (req, res) => {
  res.json({ status: "success" });
  // console.log(req.body);
  // console.log(device);
  let response = req.body;

  // console.log(response);
  printSalesSummary(response.data, response.type);
});

const convertToRupiah = (number, currency = "Rp. ") => {
  if (number) {
    var rupiah = "";
    var numberrev = number.toString().split("").reverse().join("");
    for (var i = 0; i < numberrev.length; i++)
      if (i % 3 == 0) rupiah += numberrev.substr(i, 3) + ".";
    return (
      currency +
      rupiah
        .split("", rupiah.length - 1)
        .reverse()
        .join("")
    );
  } else {
    return currency + number;
  }
};

const formatTanggal = (date) => {
  const formatter = new Intl.DateTimeFormat("id", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return formatter.format(date);
};

const currentDate = () => {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let currentDate = `${day}/${month}/${year}`;

  return currentDate;
};

const printStruck = (
  carts,
  subTotal,
  pajak,
  diskon,
  total,
  bayar,
  kembalian,
  tanggal,
  noTransaksi,
  kasir,
  customer,
  agency
) => {
  device.open(function () {
    printer
      .font("B")
      .align("CT")
      .style("B")
      .size(1.5, 1.5)
      .text(agency.name)
      .newLine()

      .style("NORMAL")
      .size(0.5, 0.5)
      .text(agency.address)
      .text(agency.noHp)
      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        { text: "Tanggal", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: ":", align: "LEFT", width: 0.1, style: "NORMAL" },
        {
          text: tanggal,
          align: "LEFT",
          width: 0.6,
          style: "NORMAL",
        },
      ])

      .tableCustom([
        { text: "Nomor Transaksi", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: ":", align: "LEFT", width: 0.1, style: "NORMAL" },
        { text: noTransaksi, align: "LEFT", width: 0.6, style: "NORMAL" },
      ])

      .tableCustom([
        { text: "Customer", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: ":", align: "LEFT", width: 0.1, style: "NORMAL" },
        { text: customer, align: "LEFT", width: 0.6, style: "NORMAL" },
      ])

      .tableCustom([
        { text: "Kasir", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: ":", align: "LEFT", width: 0.1, style: "NORMAL" },
        { text: kasir, align: "LEFT", width: 0.6, style: "NORMAL" },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        { text: "QTY", align: "LEFT", width: 0.1, style: "NORMAL" },
        { text: "Produk/Item", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: "HARGA", align: "RIGHT", width: 0.3, style: "NORMAL" },
        { text: "SUB TOTAL", align: "RIGHT", width: 0.3, style: "NORMAL" },
      ])

      .drawLine();

    carts.forEach((item, index, arr) => {
      printer.tableCustom([
        {
          text: "x" + item.qty,
          align: "LEFT",
          width: 0.1,
          style: "NORMAL",
        },
        { text: item.name, align: "LEFT", width: 0.3, style: "NORMAL" },
        {
          text: convertToRupiah(item.price, "Rp."),
          align: "RIGHT",
          width: 0.3,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(item.price * item.qty, "Rp."),
          align: "RIGHT",
          width: 0.3,
          style: "NORMAL",
        },
      ]);
    });
    printer
      .drawLine()
      .tableCustom([
        { text: "Sub Total", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: convertToRupiah(subTotal, "Rp."),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      //       .tableCustom([
      //         { text: "Pajak", align: "LEFT", width: 0.5, style: "NORMAL" },
      //         {
      //           text: convertToRupiah(pajak, "Rp."),
      //           align: "RIGHT",
      //           width: 0.5,
      //           style: "NORMAL",
      //         },
      //       ])
      //       .tableCustom([
      //         { text: "Diskon", align: "LEFT", width: 0.5, style: "NORMAL" },
      //         {
      //           text: "-(" + convertToRupiah(diskon, "Rp.") + ")",
      //           align: "RIGHT",
      //           width: 0.5,
      //           style: "NORMAL",
      //         },
      //       ])
      .tableCustom([
        { text: "Total", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: convertToRupiah(total, "Rp."),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "Bayar", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: convertToRupiah(bayar, "Rp."),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "Kembali", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: convertToRupiah(kembalian, "Rp."),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .drawLine()
      .newLine()
      .style("NORMAL")
      .size(0.5, 0.5)
      .text("Barang yang telah di beli tidak dapat ditukar/dikembalikan")
      .newLine()
      .style("BU")
      .size(0.5, 0.5)
      .text("Terima Kasih atas Kunjungan Anda :)")
      .newLine()
      .style("NORMAL")
      .size(0.5, 0.5)
      .text("Created by : " + agency.name + " pada " + tanggal)
      .newLine()
      .newLine()
      .marginBottom(15)
      .cut()
      .cashdraw()
      .close();
  });
};

const printSummary = (
  cashierID = "#123214",
  name = "kasir 1",
  shift = "Siang",
  totalSales = convertToRupiah(3549000),
  totalDisc = "-(" + convertToRupiah(0) + ")",
  totalTax = convertToRupiah(0),
  totalServCharge = convertToRupiah(0),
  totalAdjustment = convertToRupiah(0),
  total = convertToRupiah(3549000),
  numInv = 5,
  AvgInvBill = convertToRupiah(23923)
) => {
  device.open(function () {
    printer
      .font("B")
      .align("CT")
      .style("B")
      .size(1.5, 1.5)
      .text("SALES SUMMARY")

      .newLine()

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)

      .tableCustom([
        { text: "Tanggal", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: "15/01/2023" + " - " + currentDate(),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "ID", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: cashierID,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "Name", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: name,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "Shift", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: shift,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        { text: "Total Sales", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: totalSales,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "Total Discount", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: totalDisc,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Total Service Charge",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: totalServCharge,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Total Tax",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: totalTax,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Total Adjustment",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: totalAdjustment,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Total",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: total,
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])

      .newLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Invoices",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: "",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        {
          text: "Number of Inv",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: numInv,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Average Bill per Inv",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: AvgInvBill,
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .newLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Void Summary",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: "",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        {
          text: "Number of Invoices",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(1929392),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Number of Items",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(1929392),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Total",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: convertToRupiah(7328432),
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])

      .newLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Summary by Salestype",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: "",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        {
          text: "Nominal",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(1929392),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Total",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: convertToRupiah(7328432),
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])

      .newLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Summary by Payment",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: "",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        {
          text: "Cash",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(1929392),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Gopay",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(1929392),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Total",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: convertToRupiah(7328432),
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])

      .newLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Summary by Product",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: "",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .newLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "FOOD",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: "",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        { text: "Product", align: "LEFT", width: 0.5, style: "NORMAL" },
        { text: "Qty", align: "RIGHT", width: 0.1, style: "NORMAL" },
        { text: "Sub Total", align: "RIGHT", width: 0.3, style: "NORMAL" },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine();

    for (let i = 0; i < 10; i++) {
      printer
        .style("NORMAL")
        .size(0.05, 0.05)
        .tableCustom([
          {
            text: faker.faker.commerce.productName(),
            align: "LEFT",
            width: 0.5,
            style: "NORMAL",
          },
          {
            text: faker.faker.random.numeric(),
            align: "RIGHT",
            width: 0.1,
            style: "NORMAL",
          },
          {
            text: convertToRupiah(200000),
            align: "RIGHT",
            width: 0.3,
            style: "NORMAL",
          },
        ]);
    }

    printer
      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("B")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Total",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: total,
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])

      .newLine()
      .newLine()
      .newLine()
      .marginBottom(15)
      .cut()
      .close();
  });
};

const printShiftReport = (
  cashierID = "#123214",
  name = "kasir 1",
  shift = "Siang",
  totalSales = convertToRupiah(3549000),
  totalDisc = "-(" + convertToRupiah(0) + ")",
  totalTax = convertToRupiah(0),
  totalServCharge = convertToRupiah(0),
  totalAdjustment = convertToRupiah(0),
  total = convertToRupiah(3549000),
  numInv = 5,
  AvgInvBill = convertToRupiah(23923)
) => {
  device.open(function () {
    printer
      .font("B")
      .align("CT")
      .style("B")
      .size(1.5, 1.5)
      .text("SHIFT REPORT")

      .newLine()

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)

      .tableCustom([
        { text: "Toko", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: ":", align: "LEFT", width: 0.1, style: "NORMAL" },
        {
          text: "Toko2-An",
          align: "RIGHT",
          width: 0.6,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "POS", align: "LEFT", width: 0.3, style: "NORMAL" },
        { text: ":", align: "LEFT", width: 0.1, style: "NORMAL" },
        {
          text: "POS Toko",
          align: "RIGHT",
          width: 0.6,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("NORMAL")
      .size(0.05, 0.05)
      .tableCustom([
        {
          text: "Shift dibuka",
          align: "LEFT",
          width: 0.3,
          style: "NORMAL",
        },
        {
          text: ":",
          align: "LEFT",
          width: 0.1,
          style: "NORMAL",
        },
        {
          text: "Sujarwo",
          align: "RIGHT",
          width: 0.6,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: "17/01/2023 12.22",
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("I")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Laci Uang",
          align: "CENTER",
          width: 1,
          style: "I",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .tableCustom([
        { text: "Modal Awal", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: convertToRupiah(23423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Pembayaran Tunai",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Uang yang dikembalikan",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Pemasukan",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Pengeluaran",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Total Uang Tunai",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .style("I")
      .size(0.5, 0.5)
      .tableCustom([
        {
          text: "Ringkasan Penjualan",
          align: "CENTER",
          width: 1,
          style: "I",
        },
      ])

      .style("NORMAL")
      .size(0.5, 0.5)
      .drawLine()

      .tableCustom([
        {
          text: "Penjualan Kotor",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])
      .tableCustom([
        {
          text: "Pengembalian",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        { text: "Diskon", align: "LEFT", width: 0.5, style: "NORMAL" },
        {
          text: convertToRupiah(23423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Penjualan Bersih",
          align: "LEFT",
          width: 0.5,
          style: "B",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "B",
        },
      ])
      .tableCustom([
        {
          text: "Tunai",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "E-Money",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Kartu",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])
      .tableCustom([
        {
          text: "Pajak",
          align: "LEFT",
          width: 0.5,
          style: "NORMAL",
        },
        {
          text: convertToRupiah(223423),
          align: "RIGHT",
          width: 0.5,
          style: "NORMAL",
        },
      ])

      .newLine()
      .newLine()
      .newLine()
      .marginBottom(15)
      .cut()
      .close();
  });
};

const printSalesSummary = (dataTrx, type = "detail") => {
  let data = JSON.parse(dataTrx);
  console.log(data);

  if (type == "detail") {
    device.open(function () {
      printer
        .font("B")
        .align("CT")
        .style("B")
        .size(1.5, 1.5)
        .text("SALES SUMMARY")

        .newLine()

        .style("NORMAL")
        .size(0.5, 0.5)
        .drawLine()

        .style("NORMAL")
        .size(0.05, 0.05)

        .tableCustom([
          { text: "Tanggal", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.date,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .tableCustom([
          { text: "Cashier", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.cashier,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .tableCustom([
          { text: "Nama Cashier", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.cashierName,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .tableCustom([
          { text: "Shift", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.shift,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])

        .style("NORMAL")
        .size(0.5, 0.5)
        .drawLine()

        .style("NORMAL")
        .size(0.05, 0.05)
        .tableCustom([
          { text: "Total Sales", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: convertToRupiah(data.total.sales),
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .drawLine();

      printer
        .style("B")
        .size(0.5, 0.5)
        .tableCustom([
          {
            text: "SUMMARY BY PAYMENT",
            align: "LEFT",
            width: 0.5,
            style: "B",
          },
          {
            text: "",
            align: "LEFT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .newLine();

      if (data.summaryByPayment.length > 0) {
        data.summaryByPayment.forEach((item, index, arr) => {
          printer
            .style("NORMAL")
            .size(0.05, 0.05)
            .tableCustom([
              {
                text: "Total Summary by " + item.title,
                align: "LEFT",
                width: 0.5,
                style: "NORMAL",
              },
              {
                text: convertToRupiah(item.total),
                align: "RIGHT",
                width: 0.5,
                style: "NORMAL",
              },
            ]);
        });
      }

      // .tableCustom([
      //   { text: "Total Discount", align: "LEFT", width: 0.5, style: "NORMAL" },
      //   {
      //     text: convertToRupiah(data.total.disc),
      //     align: "RIGHT",
      //     width: 0.5,
      //     style: "NORMAL",
      //   },
      // ])
      // printer
      //   .tableCustom([
      //     {
      //       text: "Total Service Charge",
      //       align: "LEFT",
      //       width: 0.5,
      //       style: "NORMAL",
      //     },
      //     {
      //       text: convertToRupiah(data.total.servCharge),
      //       align: "RIGHT",
      //       width: 0.5,
      //       style: "NORMAL",
      //     },
      //   ])
      // .tableCustom([
      //   {
      //     text: "Total Tax",
      //     align: "LEFT",
      //     width: 0.5,
      //     style: "NORMAL",
      //   },
      //   {
      //     text: convertToRupiah(data.total.tax),
      //     align: "RIGHT",
      //     width: 0.5,
      //     style: "NORMAL",
      //   },
      // ])
      // .tableCustom([
      //   {
      //     text: "Total Adjustment",
      //     align: "LEFT",
      //     width: 0.5,
      //     style: "NORMAL",
      //   },
      //   {
      //     text: convertToRupiah(data.total.adjustment),
      //     align: "RIGHT",
      //     width: 0.5,
      //     style: "NORMAL",
      //   },
      // ])

      printer
        .style("NORMAL")
        .size(0.5, 0.5)
        .drawLine()

        // .style("B")
        // .size(0.5, 0.5)
        // .tableCustom([
        //   {
        //     text: "Total",
        //     align: "LEFT",
        //     width: 0.5,
        //     style: "B",
        //   },
        //   {
        //     text: convertToRupiah(data.total.total),
        //     align: "RIGHT",
        //     width: 0.5,
        //     style: "B",
        //   },
        // ])

        .newLine()

        .style("B")
        .size(0.5, 0.5)
        .tableCustom([
          {
            text: "SUMMARY BY CASH",
            align: "LEFT",
            width: 0.5,
            style: "B",
          },
          {
            text: "",
            align: "LEFT",
            width: 0.5,
            style: "NORMAL",
          },
        ])

        .newLine();

      if ("CASH" in data.summary) {
        data.summary.CASH.invoice.forEach((item1, index1, arr1) => {
          printer
            .style("B")
            .size(0.5, 0.5)
            .tableCustom([
              {
                text: item1.code,
                align: "LEFT",
                width: 0.5,
                style: "B",
              },
              {
                text: "",
                align: "RIGHT",
                width: 0.5,
                style: "B",
              },
            ])

            .style("NORMAL")
            .size(0.05, 0.05)
            .drawLine()

            .style("NORMAL")
            .size(0.05, 0.05)
            .tableCustom([
              { text: "Product", align: "LEFT", width: 0.5, style: "NORMAL" },
              { text: "QTY", align: "CENTER", width: 0.1, style: "NORMAL" },
              {
                text: "SUB TOTAL",
                align: "RIGHT",
                width: 0.3,
                style: "NORMAL",
              },
            ])

            .drawLine();

          item1.product.forEach((item2, index2, arr2) => {
            printer
              .style("NORMAL")
              .size(0.05, 0.05)
              .tableCustom([
                {
                  text: item2.productName,
                  align: "LEFT",
                  width: 0.5,
                  style: "NORMAL",
                },
                {
                  text: item2.qty,
                  align: "CENTER",
                  width: 0.1,
                  style: "NORMAL",
                },
                {
                  text: convertToRupiah(item2.subTotal),
                  align: "RIGHT",
                  width: 0.3,
                  style: "NORMAL",
                },
              ]);
          });

          printer.drawLine();

          // if (index + 1 != data.summary.CASH.invoice.length) {
          //   printer.newLine();
          // }
        });

        printer
          .style("B")
          .size(0.5, 0.5)
          .tableCustom([
            {
              text: "Total Summary by " + data.summary.CASH.title,
              align: "LEFT",
              width: 0.5,
              style: "B",
            },
            {
              text: convertToRupiah(data.summary.CASH.total),
              align: "RIGHT",
              width: 0.5,
              style: "B",
            },
          ])
          .newLine();
      }

      if ("DEBIT" in data.summary) {
        data.summary.DEBIT.forEach((item1, index1, arr1) => {
          printer
            .style("B")
            .size(0.5, 0.5)
            .tableCustom([
              {
                text: "SUMMARY BY DEBIT " + item1.title,
                align: "LEFT",
                width: 0.5,
                style: "B",
              },
              {
                text: "",
                align: "LEFT",
                width: 0.5,
                style: "NORMAL",
              },
            ])
            .newLine();

          item1.invoice.forEach((item2, index2, arr2) => {
            printer
              .style("B")
              .size(0.5, 0.5)
              .tableCustom([
                {
                  text: item2.code,
                  align: "LEFT",
                  width: 0.5,
                  style: "B",
                },
                {
                  text: "",
                  align: "RIGHT",
                  width: 0.5,
                  style: "B",
                },
              ])

              .style("NORMAL")
              .size(0.05, 0.05)
              .drawLine()

              .style("NORMAL")
              .size(0.05, 0.05)
              .tableCustom([
                { text: "Product", align: "LEFT", width: 0.5, style: "NORMAL" },
                { text: "QTY", align: "CENTER", width: 0.1, style: "NORMAL" },
                {
                  text: "SUB TOTAL",
                  align: "RIGHT",
                  width: 0.3,
                  style: "NORMAL",
                },
              ])

              .drawLine();

            item2.product.forEach((item3, index3, arr3) => {
              printer
                .style("NORMAL")
                .size(0.05, 0.05)
                .tableCustom([
                  {
                    text: item3.productName,
                    align: "LEFT",
                    width: 0.5,
                    style: "NORMAL",
                  },
                  {
                    text: item3.qty,
                    align: "CENTER",
                    width: 0.1,
                    style: "NORMAL",
                  },
                  {
                    text: convertToRupiah(item3.subTotal),
                    align: "RIGHT",
                    width: 0.3,
                    style: "NORMAL",
                  },
                ]);
            });

            printer.drawLine();

            // if (index + 1 != item.invoice.length) {
            //   printer.newLine();
            // }
          });
          printer
            .style("B")
            .size(0.5, 0.5)
            .tableCustom([
              {
                text: "Total Summary by DEBIT " + item1.title,
                align: "LEFT",
                width: 0.5,
                style: "B",
              },
              {
                text: convertToRupiah(item1.total),
                align: "RIGHT",
                width: 0.5,
                style: "B",
              },
            ])
            .newLine();
        });
      }

      if ("KREDIT" in data.summary) {
        data.summary.KREDIT.forEach((item1, index1, arr1) => {
          printer
            .style("B")
            .size(0.5, 0.5)
            .tableCustom([
              {
                text: "SUMMARY BY KREDIT " + item1.title,
                align: "LEFT",
                width: 0.5,
                style: "B",
              },
              {
                text: "",
                align: "LEFT",
                width: 0.5,
                style: "NORMAL",
              },
            ])
            .newLine();

          item1.invoice.forEach((item2, index2, arr2) => {
            printer
              .style("B")
              .size(0.5, 0.5)
              .tableCustom([
                {
                  text: item2.code,
                  align: "LEFT",
                  width: 0.5,
                  style: "B",
                },
                {
                  text: "",
                  align: "RIGHT",
                  width: 0.5,
                  style: "B",
                },
              ])

              .style("NORMAL")
              .size(0.05, 0.05)
              .drawLine()

              .style("NORMAL")
              .size(0.05, 0.05)
              .tableCustom([
                { text: "Product", align: "LEFT", width: 0.5, style: "NORMAL" },
                { text: "QTY", align: "CENTER", width: 0.1, style: "NORMAL" },
                {
                  text: "SUB TOTAL",
                  align: "RIGHT",
                  width: 0.3,
                  style: "NORMAL",
                },
              ])

              .drawLine();

            item2.product.forEach((item2, index2, arr2) => {
              printer
                .style("NORMAL")
                .size(0.05, 0.05)
                .tableCustom([
                  {
                    text: item2.productName,
                    align: "LEFT",
                    width: 0.5,
                    style: "NORMAL",
                  },
                  {
                    text: item2.qty,
                    align: "CENTER",
                    width: 0.1,
                    style: "NORMAL",
                  },
                  {
                    text: convertToRupiah(item2.subTotal),
                    align: "RIGHT",
                    width: 0.3,
                    style: "NORMAL",
                  },
                ]);
            });

            printer.drawLine();

            // if (index + 1 != item.invoice.length) {
            //   printer.newLine();
            // }
          });
          printer
            .style("B")
            .size(0.5, 0.5)
            .tableCustom([
              {
                text: "Total Summary by KREDIT " + item1.title,
                align: "LEFT",
                width: 0.5,
                style: "B",
              },
              {
                text: convertToRupiah(item1.total),
                align: "RIGHT",
                width: 0.5,
                style: "B",
              },
            ])
            .newLine();
        });
      }

      printer.newLine().newLine().newLine().marginBottom(15).cut().close();
    });
  } else {
    device.open(function () {
      printer
        .font("B")
        .align("CT")
        .style("B")
        .size(1.5, 1.5)
        .text("SALES SUMMARY")

        .newLine()

        .style("NORMAL")
        .size(0.5, 0.5)
        .drawLine()

        .style("NORMAL")
        .size(0.05, 0.05)

        .tableCustom([
          { text: "Tanggal", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.date,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .tableCustom([
          { text: "Cashier", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.cashier,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .tableCustom([
          { text: "Nama Cashier", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.cashierName,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])
        .tableCustom([
          { text: "Shift", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: data.shift,
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ])

        .style("NORMAL")
        .size(0.5, 0.5)
        .drawLine()

        .style("NORMAL")
        .size(0.05, 0.05)
        .tableCustom([
          { text: "Total Sales", align: "LEFT", width: 0.5, style: "NORMAL" },
          {
            text: convertToRupiah(data.total.sales),
            align: "RIGHT",
            width: 0.5,
            style: "NORMAL",
          },
        ]);

      if (data.summaryByPayment.length > 0) {
        data.summaryByPayment.forEach((item, index, arr) => {
          printer
            .style("NORMAL")
            .size(0.05, 0.05)
            .tableCustom([
              {
                text: "Total Summary by " + item.title,
                align: "LEFT",
                width: 0.5,
                style: "NORMAL",
              },
              {
                text: convertToRupiah(item.total),
                align: "RIGHT",
                width: 0.5,
                style: "NORMAL",
              },
            ]);
        });
      }

      printer
        .style("NORMAL")
        .size(0.5, 0.5)
        .drawLine()
        .newLine()
        .newLine()
        .newLine()
        .newLine()
        .marginBottom(15)
        .cut()
        .close();
    });
  }
};
