import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/login`);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: "login" }
    );
  }

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  app.commandLine.appendSwitch("disable-gpu-sandbox");
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function drawPageHeader(page, logoImage, fonts, title) {
  const { width, height } = page.getSize();
  const margin = 50;
  const y = height - margin;

  page.drawImage(logoImage, { x: margin, y: y - 40, width: 40, height: 40 });

  let textY = y - 10;
  page.drawText("Corpo em Forma", {
    x: margin + 50,
    y: textY,
    size: 16,
    font: fonts.bold,
  });
  textY -= 15;
  page.drawText("Rua Tabelião Eneas, 60, Centro, Quixadá, Ceará", {
    x: margin + 50,
    y: textY,
    size: 9,
    font: fonts.normal,
    color: rgb(0.3, 0.3, 0.3),
  });
  textY -= 12;
  page.drawText("CNPJ: 40.522.014/0001-90 | Tel: (88) 996106590", {
    x: margin + 50,
    y: textY,
    size: 9,
    font: fonts.normal,
    color: rgb(0.3, 0.3, 0.3),
  });

  const emissionDate = new Date().toLocaleDateString("pt-BR");
  const emissionText = `Emitido em: ${emissionDate}`;
  const titleWidth = fonts.bold.widthOfTextAtSize(title, 14);
  const dateWidth = fonts.normal.widthOfTextAtSize(emissionText, 10);

  page.drawText(title, {
    x: width - margin - titleWidth,
    y: y - 10,
    size: 14,
    font: fonts.bold,
    color: rgb(0, 0, 0),
  });
  page.drawText(emissionText, {
    x: width - margin - dateWidth,
    y: y - 28,
    size: 10,
    font: fonts.normal,
    color: rgb(0.3, 0.3, 0.3),
  });

  return height - margin - 80;
}

function drawPageFooter(page, pageNum, totalPages, font) {
  const { width, height } = page.getSize();
  const margin = 50;
  const footerText = `Página ${pageNum} de ${totalPages}`;
  const textWidth = font.widthOfTextAtSize(footerText, 9);

  page.drawText(footerText, {
    x: width - margin - textWidth,
    y: margin / 2,
    size: 9,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
}

async function createPdf(options) {
  const { title, headers, columnWidths, data, defaultFileName } = options;
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: `Salvar Relatório de ${title}`,
    defaultPath:
      defaultFileName ||
      `relatorio_${new Date().toISOString().split("T")[0]}.pdf`,
    filters: [{ name: "Arquivos PDF", extensions: ["pdf"] }],
  });
  if (canceled || !filePath)
    return { success: false, error: "Save dialog canceled" };

  try {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );
    const fonts = { normal: helveticaFont, bold: helveticaBoldFont };

    let logoPath;
    if (app.isPackaged) {
      logoPath = path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/assets/logo/icon.png`
      );
    } else {
      logoPath = path.join(process.cwd(), "src/assets/logo/icon.png");
    }
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const isPortrait = title.toLowerCase().includes("demonstrativo");
    let page = pdfDoc.addPage(isPortrait ? [595.28, 841.89] : [841.89, 595.28]);

    const { width, height } = page.getSize();
    const margin = 50;
    const rowHeight = 20;

    const drawTableHeader = (currentPage, yPos) => {
      const tableRowHeight = 25;
      currentPage.drawRectangle({
        x: margin,
        y: yPos - tableRowHeight,
        width: width - margin * 2,
        height: tableRowHeight,
        color: rgb(0.9, 0.9, 0.9),
      });
      let currentX = margin + 5;
      currentPage.setFont(helveticaBoldFont);
      currentPage.setFontSize(10);
      headers.forEach((header, i) => {
        currentPage.drawText(header, {
          x: currentX,
          y: yPos - 17,
          color: rgb(0, 0, 0),
        });
        currentX += columnWidths[i];
      });
      return yPos - tableRowHeight;
    };

    let y = await drawPageHeader(page, logoImage, fonts, title);
    y = drawTableHeader(page, y);

    page.setFont(helveticaFont);
    page.setFontSize(10);

    for (const [index, row] of data.entries()) {
      if (y < margin + rowHeight) {
        page = pdfDoc.addPage(isPortrait ? [595.28, 841.89] : [841.89, 595.28]);
        y = await drawPageHeader(page, logoImage, fonts, title);
        y = drawTableHeader(page, y);
      }
      if (index % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - rowHeight,
          width: width - margin * 2,
          height: rowHeight,
          color: rgb(0.97, 0.97, 0.97),
        });
      }

      let currentX = margin + 5;
      row.forEach((text, i) => {
        let textColor = rgb(0, 0, 0);
        if (isPortrait) {
          if (String(text).includes("(")) textColor = rgb(0.7, 0, 0);
          if (
            String(text).includes("RESULTADO") &&
            !String(row[1]).includes("(")
          )
            textColor = rgb(0, 0.5, 0);
        }
        page.drawText(text || "-", {
          x: currentX,
          y: y - 14,
          color: textColor,
        });
        currentX += columnWidths[i];
      });
      y -= rowHeight;
    }

    const totalPages = pdfDoc.getPageCount();
    pdfDoc.getPages().forEach((p, i) => {
      drawPageFooter(p, i + 1, totalPages, helveticaFont);
    });

    const pdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(filePath, pdfBytes);
    return { success: true, path: filePath };
  } catch (error) {
    console.error("Falha ao gerar o PDF:", error);
    return { success: false, error: error.message };
  }
}

ipcMain.handle("generate-report", async (event, options) => {
  return await createPdf(options);
});

ipcMain.handle("generate-detailed-student-report", async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Salvar Relatório Detalhado de Alunos",
    defaultPath: `relatorio_detalhado_alunos_${new Date().toISOString().split("T")[0]}.pdf`,
    filters: [{ name: "Arquivos PDF", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) {
    return { success: false, error: "Save dialog canceled" };
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );
    const fonts = { normal: helveticaFont, bold: helveticaBoldFont };

    let logoPath;
    if (app.isPackaged) {
      logoPath = path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/assets/logo/icon.png`
      );
    } else {
      logoPath = path.join(process.cwd(), "src/assets/logo/icon.png");
    }
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    let page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();
    const margin = 40;
    const lineGap = 13;
    const sectionGap = 18;
    const blockHeight = 100;

    let y = await drawPageHeader(
      page,
      logoImage,
      fonts,
      "Relatório Detalhado de Alunos"
    );

    const col1_x = margin;
    const col2_x = margin + 250;
    const col3_x = margin + 500;
    const labelWidth = 65;

    const drawField = (label, value, x, yPos) => {
      if (!value) value = "Não informado";
      page.drawText(label, {
        x: x,
        y: yPos,
        size: 7,
        font: helveticaBoldFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      page.drawText(value, {
        x: x + labelWidth,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      return yPos - lineGap;
    };

    for (const [index, student] of data.entries()) {
      if (y < margin + blockHeight) {
        page = pdfDoc.addPage([841.89, 595.28]);
        y = await drawPageHeader(
          page,
          logoImage,
          fonts,
          "Relatório Detalhado de Alunos"
        );
      }

      let y_col1 = y;
      let y_col2 = y;
      let y_col3 = y;

      y_col1 = drawField("Nome:", student.nome, col1_x, y_col1);
      y_col1 = drawField("Matrícula:", student.matricula, col1_x, y_col1);
      y_col1 = drawField("Plano:", student.plano, col1_x, y_col1);
      y_col1 = drawField(
        "Matrícula em:",
        student.data_matricula,
        col1_x,
        y_col1
      );
      y_col1 = drawField("Expiração:", student.data_expiracao, col1_x, y_col1);
      y_col1 = drawField("Status:", student.status, col1_x, y_col1);

      y_col2 = drawField("CPF:", student.cpf, col2_x, y_col2);
      y_col2 = drawField(
        "Data de Nasc.:",
        student.dataNascimento,
        col2_x,
        y_col2
      );
      y_col2 = drawField("Gênero:", student.genero, col2_x, y_col2);

      y_col3 = drawField("Email:", student.email, col3_x, y_col3);
      y_col3 = drawField("Telefone:", student.telefone, col3_x, y_col3);
      const address = student.endereco
        ? `${student.endereco.logradouro}, ${student.endereco.numero}`
        : "Não informado";
      y_col3 = drawField("Endereço:", address, col3_x, y_col3);

      y = Math.min(y_col1, y_col2, y_col3) - sectionGap / 2;

      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= sectionGap;
    }

    const totalPages = pdfDoc.getPageCount();
    pdfDoc.getPages().forEach((p, i) => {
      drawPageFooter(p, i + 1, totalPages, helveticaFont);
    });

    const pdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(filePath, pdfBytes);

    return { success: true, path: filePath };
  } catch (error) {
    console.error("Falha ao gerar o PDF:", error);
    return { success: false, error: error.message };
  }
});