/**
 * ─────────────────────────────────────────────────────────────
 *  NƠI CÁ NHÂN HOÁ DUY NHẤT
 *  Mọi nội dung của món quà nằm ở đây. Chỉ cần sửa file này.
 *  - Tên người yêu: her
 *  - Tên người gửi: sender
 *  - Ảnh kỷ niệm: memories (bỏ ảnh vào public/photos/)
 *  - Nhạc: music.src = '/music/bai-hat-cua-minh.mp3' (tuỳ chọn)
 * ─────────────────────────────────────────────────────────────
 */

export const content = {
  her: {
    name: 'Dương Diễm Châu',
    displayName: 'Em',
    nickname: 'Công chúa của anh - Dương Diễm Châu',
    initial: 'E',
  },
  sender: {
    name: 'Anh',
    initial: 'A',
  },
  // Dùng để hiển thị ngày sinh (không tự tính tuổi)
  birthday: {
    day: '16',
    month: '11',
    label: '16 · 11',
    year: '1994',
  },

  loading: {
    line1: 'Vũ trụ nhỏ của chúng mình',
    line2: 'Đang thắp sáng những vì sao…',
  },

  intro: {
    line1: 'Một thế giới nhỏ, dành riêng cho em...',
    line2: 'Chúc mừng sinh nhật, em yêu ❤️',
    button: 'Mở quà của bé',
    hint: 'Một món quà nhỏ, giấu cả một vũ trụ.',
  },

  garden: {
    title: 'Vũ trụ nhỏ của chúng mình',
    subtitle: 'Khu vườn của riêng hai đứa mình',
    hint: 'Chạm vào những ánh sáng trong vườn…',
    // Mỗi vật thể trong vườn gắn với một lời nhắn.
    messages: {
      tree: {
        title: 'Mỗi khoảnh khắc bên em đều thật đặc biệt.',
        text: 'Cây hoa này lớn lên từng ngày, như tình cảm của anh dành cho em — lặng lẽ, bền bỉ, và luôn nở hoa.',
      },
      heart: [
        {
          title: 'Em làm thế giới của anh trở nên tươi đẹp.',
          text: 'Trước khi gặp em, thế giới của anh chỉ là những ngày bình thường. Em đến, và mọi thứ có màu.',
        },
        {
          title: 'Nơi anh yêu thích nhất là bên cạnh em.',
          text: 'Không phải một nơi nào trên bản đồ. Chỉ cần là cạnh em, ở đâu anh cũng thấy như về nhà.',
        },
        {
          title: 'Em là bình yên, cũng là cuộc phiêu lưu của anh.',
          text: 'Ở cạnh em, anh vừa thấy bình yên như một buổi chiều mưa, vừa thấy háo hức như ngày đầu tiên.',
        },
      ],
      moon: {
        title: 'Em là vì sao sáng nhất của anh.',
        text: 'Giữa rất nhiều điều đẹp đẽ trên đời, em vẫn là thứ anh tìm thấy đầu tiên khi ngước lên.',
      },
      lantern: {
        title: 'Em là ánh sáng dẫn lối anh trở về.',
        text: 'Có những ngày anh lạc đường. Rồi anh nhớ đến em — và mọi thứ lại sáng lên.',
      },
      lake: {
        title: 'Mỗi hình bóng của em đều là khung cảnh anh yêu nhất.',
        text: 'Mặt hồ giữ ánh trăng, còn anh thì giữ những hình ảnh của em. Cả hai đều là những thứ đẹp nhất ban đêm.',
      },
      firefly: {
        title: 'Ngàn lý do nhỏ bé để yêu em.',
        text: 'Như những đốm sáng nhỏ trong vườn — lúc đầu chỉ là vài điều nhỏ xíu, rồi anh nhận ra mình yêu em bằng cả một bầu trời.',
      },
      star: {
        title: 'Hãy ước nguyện cho đôi mình.',
        text: 'Nếu có một ngôi sao rơi, anh sẽ không ước gì cho riêng mình. Anh chỉ ước được ở cạnh em thật lâu.',
      },
    },
    // Thứ tự gợi ý cho trái tim (có thể để nguyên)
    heartOrder: ['heart', 'heart', 'heart'],
  },

  letter: {
    title: 'Lá thư gửi em',
    subtitle: 'Một lá thư, viết bằng cả trái tim',
    hint: 'Chạm vào phong thư để mở',
    greeting: 'Gửi em yêu,',
    paragraphs: [
      'Chúc mừng sinh nhật em yêu.',
      'Anh không biết phải dùng bao nhiêu lời để diễn tả em đặc biệt như thế nào đối với anh.',
      'Cảm ơn em vì đã xuất hiện trong cuộc đời anh, vì những nụ cười, những khoảnh khắc nhỏ bé và tất cả những điều tuyệt vời mà chúng ta đã cùng nhau trải qua.',
      'Anh mong rằng tuổi mới của em sẽ luôn ngập tràn hạnh phúc, bình an và những điều đẹp đẽ nhất.',
      'Và anh hy vọng mình sẽ còn được ở bên em, cùng em viết tiếp thật nhiều câu chuyện đẹp.',
    ],
    closing: 'Anh yêu em, hôm nay, ngày mai và mãi mãi. ❤️',
    signature: 'Anh.',
    ps: 'P.S. Ở lại đây lâu một chút nhé, thế giới này nhỏ thôi nhưng có đủ em và anh.',
  },

  memories: {
    title: 'Kỷ niệm của chúng mình',
    subtitle: 'Những mảnh ghép của chúng ta',
    hint: 'Kéo để xoay · Chạm vào ảnh để xem',
    // Thay ảnh tại: public/photos/ — giữ nguyên tên hoặc sửa src bên dưới.
    photos: [
      {
        src: '/photos/memory-1.jpg',
        caption: 'Lần đầu mình nói chuyện đến khuya',
        date: 'Khuya Đà Lạt',
        note: 'Anh nhớ hôm đó mình nói đủ thứ chuyện, và anh đã mong trời đừng sáng.',
      },
{
  src: '/photos/memory-2.jpg',
  caption: 'Ngọt ngào như cách em cười',
  date: 'Một buổi dạo chơi',
  note: 'Một quả dâu nhỏ, một chút trêu đùa và một khoảnh khắc đáng yêu. Những điều giản dị bên em cũng đủ trở thành kỷ niệm anh muốn cất giữ.',
},
      {
        src: '/photos/memory-3.jpg',
        caption: 'Bữa tối không cần lý do',
        date: 'Một tối',
        note: 'Điều anh thích nhất không phải món ăn, mà là em ngồi cạnh anh.',
      },
      {
  src: '/photos/memory-4.jpeg',
  caption: 'Anh & Em, thế là đủ',
  date: 'Một ngày đầy nắng',
  note: 'Giữa thành phố đông người, mình vẫn tìm thấy nhau. Có lẽ điều lãng mạn nhất là dù ở đâu, người anh muốn nắm tay vẫn luôn là em.',
},
      {
  src: '/photos/memory-5.jpg',
  caption: 'Thế giới nhỏ của hai đứa',
  date: 'Một buổi sáng',
  note: 'Chẳng cần đi đâu xa, chỉ cần một căn phòng gỗ, chút nắng ngoài cửa sổ và có em ở ngay bên cạnh.',
},
      {
  src: '/photos/memory-6.jpg',
  caption: 'Một chút bình yên bên nhau',
  date: 'Một ngày ở Đà Lạt',
  note: 'Giữa khung cảnh núi rừng rộng lớn, điều khiến anh muốn giữ lại nhất vẫn là khoảnh khắc được ôm em trong vòng tay.',
},
    ],
  },

  celebration: {
    title1: 'Chúc mừng sinh nhật',
    title2: 'Công chúa của anh',
    subtitle: 'Một ngày mà cả thế giới nên mỉm cười',
    wishButton: 'Ước một điều',
    wishHint: 'Chạm để thổi nến và ước một điều…',
    blowing: 'Đang thổi nến…',
    wishMessage: 'Mong mọi điều ước của em đều thành hiện thực.',
    wishMessage2: 'Anh sẽ luôn ở đây vì em. ❤️',
    finalNote: 'Điều ước của em, anh sẽ cùng em giữ.',
    replay: 'Khám phá lại',
    stay: 'Ở lại một chút',
  },

  music: {
    // Đặt file mp3 vào public/music/ rồi điền đường dẫn ở đây, ví dụ:
    // src: '/music/our-song.mp3',
    // Nếu để null, hệ thống sẽ tự chơi một bản piano được tạo trực tiếp
    // bằng Web Audio — không cần file, không tự phát to khi vừa vào web.
    src: null,
    title: 'Điệu Waltz nhỏ dành cho em',
    artist: 'Piano, vang lên từ những vì sao',
    volume: 0.42,
  },

  navigation: [
    { id: 'gift', label: 'Món quà', short: 'Quà' },
    { id: 'garden', label: 'Vũ trụ của mình', short: 'Khu vườn' },
    { id: 'letter', label: 'Lá thư', short: 'Thư' },
    { id: 'memories', label: 'Kỷ niệm', short: 'Kỷ niệm' },
    { id: 'celebration', label: 'Mừng sinh nhật', short: 'Điều ước' },
  ],

  hud: {
    hint: 'Kéo để xoay · Cuộn để tiến gần · Chạm vào vật thể để khám phá',
    musicOn: 'Nhạc đang chơi',
    musicOff: 'Bật nhạc',
    stay: 'Ở lại một chút',
  },

  music: {
    // Đặt file mp3 vào public/music/ rồi điền đường dẫn ở đây, ví dụ:
    // src: '/music/our-song.mp3',
    // Nếu để null, hệ thống sẽ tự chơi một bản piano được tạo trực tiếp
    // bằng Web Audio — không cần file, không tự phát to khi vừa vào web.
    src: null,
    title: 'Điệu Waltz nhỏ dành cho em',
    artist: 'Piano, vang lên từ những vì sao',
    volume: 0.42,
  },

  navigation: [
    { id: 'gift', label: 'Món quà', short: 'Quà' },
    { id: 'garden', label: 'Vũ trụ của mình', short: 'Khu vườn' },
    { id: 'letter', label: 'Lá thư', short: 'Thư' },
    { id: 'memories', label: 'Kỷ niệm', short: 'Kỷ niệm' },
    { id: 'celebration', label: 'Mừng sinh nhật', short: 'Điều ước' },
  ],

  hud: {
    hint: 'Kéo để xoay · Cuộn để tiến gần · Chạm vào vật thể để khám phá',
    musicOn: 'Nhạc đang chơi',
    musicOff: 'Bật nhạc',
  },

  finalSignature: '— Anh, người luôn ở đây vì em',
}

export const navScenes = content.navigation.map((n) => n.id)

export const getGardenMessage = (key) => {
  const m = content.garden.messages[key]
  if (!m) return null
  return Array.isArray(m) ? m[0] : m
}
