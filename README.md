# 🎮 WebKit CSSFontFace Exploit for PS4/PS5

Exploit berbasis vulnerability **CSSFontFace** pada WebKit PlayStation 4 dan PlayStation 5.

Repository ini berisi chain exploit yang memanfaatkan bug **CSSFontFace** untuk mendapatkan primitive tertentu di WebKit, yang kemudian dapat digunakan sebagai bagian dari exploit chain.

> ⚠️ **Catatan:** Repository ini ditujukan untuk riset keamanan, eksploitasi WebKit, dan eksperimen pada perangkat yang memang kamu miliki atau punya izin untuk mengujinya. Jangan jadi manusia yang ngetes di perangkat orang lalu pura-pura kaget kalau rusak.

---

## 🧩 Vulnerability Scope

Rentang firmware yang diketahui terdampak oleh vulnerability **CSSFontFace**:

| Platform         | Firmware yang terdampak |
| :--------------- | :---------------------- |
| 🎮 PlayStation 4 | **6.00 – 13.52**        |
| 🎮 PlayStation 5 | **1.00 – 13.40**        |

---

## 💥 Exploitable In

Untuk chain exploit yang tersedia saat ini:

| Platform         | Firmware yang bisa dieksploitasi |
| :--------------- | :------------------------------- |
| 🎮 PlayStation 4 | **6.00 – 11.02**                 |
| 🎮 PlayStation 5 | **1.00 – 8.60**                  |

### PS5

PS5 juga secara teori masih bisa dieksploitasi apabila **ASLR berhasil dikalahkan**.

Hal tersebut dapat dilakukan melalui:

* Heap-shaping trick
* Bug leak terpisah
* Mendapatkan kembali expected vtable pointer sebelum masuk ke native crash path

Jadi masalahnya bukan sekadar "bug-nya ada atau nggak", tetapi chain-nya juga harus bisa melewati mekanisme proteksi yang ada. Sony tentu saja tidak membiarkan pintu belakang terbuka sambil menyediakan karpet merah.

---

## 🛠️ Supported by This Repository

Repository ini saat ini mendukung:

| Platform         |    CSSFontFace   |  Kernel Exploit  |
| :--------------- | :--------------: | :--------------: |
| 🎮 PlayStation 4 | **6.00 – 11.02** | **7.00 – 11.02** |
| 🎮 PlayStation 5 |       ❌ N/A      |       ❌ N/A      |

### Payload / HEN

Kalau mau menggunakan payload atau HEN pilihanmu sendiri, taruh file tersebut di:

```text
public/src/payload.bin
```

Nama file **harus**:

```text
payload.bin
```

Jadi struktur sederhananya kira-kira:

```text
public/
└── src/
    └── payload.bin
```

Tinggal ganti `payload.bin` dengan payload/HEN yang ingin digunakan.

---

## ⚠️ Limitations

### PS4

Pada versi WebKit yang lebih baru di PlayStation 4, khususnya:

```text
11.50 – Latest
```

mekanisme `CSSFontFace` mengalami perubahan.

Sony mendesain ulang bagian **get/set property handling** dan memperkenalkan:

```text
m_propertiesOrCSSConnection
```

Karena perubahan tersebut, ditambah beberapa perubahan layout lainnya, primitive:

```text
m_featureSettings
```

yang digunakan oleh repository ini sudah tidak bisa dipakai lagi pada firmware di atas range yang didukung.

Dengan kata lain, vulnerability-nya bisa saja masih ada dalam bentuk tertentu, tetapi **chain exploit yang digunakan repository ini tidak lagi kompatibel**.

---

### PS5

Pada PlayStation 5 terdapat beberapa hambatan tambahan, terutama:

* Vtable checks
* WebKit ASLR

Karena itu, chain dari repository ini tidak dapat berjalan tanpa adanya:

1. Mekanisme untuk mengalahkan ASLR
2. Recovery terhadap vtable yang dibutuhkan

Jadi untuk PS5, bukan tinggal klik lalu magically jailbreak. Kalau sesederhana itu, peneliti keamanan sudah pada kehilangan pekerjaan.

---

## 📚 Technical Writeup

Pembahasan teknis mengenai vulnerability dan exploit chain dapat dibaca di:

**CSSFontFace UAF on PlayStation**

https://linearfox.com/blog/cssfontface-uaf-playstation

---

## 👨‍💻 Collaborators / Research References

Project ini tidak berdiri sendirian. Beberapa researcher dan project yang menjadi bagian dari riset serta referensi:

### 🔬 Researchers

* **ufm42**
  Bug Research & Full Chain Exploit Development
  https://github.com/ufm42

* **Nathan Fargo (@ntfargo)**
  Bug Research, Writeup & Exploit Development
  https://github.com/ntfargo

* **Dr.Yenyen**
  Testing
  https://github.com/DrYenyen

### 📖 References

* **Hacking the PS4 by CTurt (2015)**
  https://cturt.github.io/ps4.html

* **PS5 WebKit Execution**
  Old PS5 WebKit contributors (2022)
  https://github.com/ChendoChap/PS5-Webkit-Execution

---

## ❤️ Credits

Huge respect buat semua researcher yang sudah melakukan reverse engineering, debugging, testing, dan pengembangan exploit chain ini.

Riset security itu kerjaan yang isinya berjam-jam melihat memory address, crash log, pointer, dan error yang kelihatannya seperti kutukan kuno. Jadi credit tetap harus diberikan ke orang-orang yang memang mengerjakannya.

---

## 📜 Copyright

**© 2026 Anas x Sanchezz**

Made for research, learning, and experimentation.

---
