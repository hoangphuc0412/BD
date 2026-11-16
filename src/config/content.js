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
    name: 'Em Yêu',
    displayName: 'Em',
    nickname: 'My Princess',
    initial: 'E',
  },
  sender: {
    name: 'Anh',
    initial: 'A',
  },
  // Dùng để hiển thị ngày sinh (không tự tính tuổi)
  birthday: {
    day: '20',
    month: '11',
    label: '20 · 11',
    year: '2001',
  },

  loading: {
    line1: 'Our Little Universe',
    line2: 'Đang thắp sáng những vì sao…',
  },

  intro: {
    line1: 'A little world, made just for you...',
    line2: 'Happy Birthday, My Love ❤️',
    button: 'Open your gift',
    hint: 'Một món quà nhỏ, giấu cả một vũ trụ.',
  },

  garden: {
    title: 'Our Little Universe',
    subtitle: 'Khu vườn của riêng hai đứa mình',
    hint: 'Chạm vào những ánh sáng trong vườn…',
    // Mỗi vật thể trong vườn gắn với một lời nhắn.
    messages: {
      tree: {
        title: 'Every moment with you is special.',
        text: 'Cây hoa này lớn lên từng ngày, như tình cảm của anh dành cho em — lặng lẽ, bền bỉ, và luôn nở hoa.',
      },
      heart: [
        {
          title: 'You make my world beautiful.',
          text: 'Trước khi gặp em, thế giới của anh chỉ là những ngày bình thường. Em đến, và mọi thứ có màu.',
        },
        {
          title: 'My favourite place is next to you.',
          text: 'Không phải một nơi nào trên bản đồ. Chỉ cần là cạnh em, ở đâu anh cũng thấy như về nhà.',
        },
        {
          title: 'You are my calm and my adventure.',
          text: 'Ở cạnh em, anh vừa thấy bình yên như một buổi chiều mưa, vừa thấy háo hức như ngày đầu tiên.',
        },
      ],
      moon: {
        title: 'You are my brightest star.',
        text: 'Giữa rất nhiều điều đẹp đẽ trên đời, em vẫn là thứ anh tìm thấy đầu tiên khi ngước lên.',
      },
      lantern: {
        title: 'You are the light I find my way back to.',
        text: 'Có những ngày anh lạc đường. Rồi anh nhớ đến em — và mọi thứ lại sáng lên.',
      },
      lake: {
        title: 'Every reflection of you is my favourite view.',
        text: 'Mặt hồ giữ ánh trăng, còn anh thì giữ những hình ảnh của em. Cả hai đều là những thứ đẹp nhất ban đêm.',
      },
      firefly: {
        title: 'A thousand little reasons to love you.',
        text: 'Như những đốm sáng nhỏ trong vườn — lúc đầu chỉ là vài điều nhỏ xíu, rồi anh nhận ra mình yêu em bằng cả một bầu trời.',
      },
      star: {
        title: 'Wish upon us.',
        text: 'Nếu có một ngôi sao rơi, anh sẽ không ước gì cho riêng mình. Anh chỉ ước được ở cạnh em thật lâu.',
      },
    },
    // Thứ tự gợi ý cho trái tim (có thể để nguyên)
    heartOrder: ['heart', 'heart', 'heart'],
  },

  letter: {
    title: 'A Letter for You',
    subtitle: 'Một lá thư, viết bằng cả trái tim',
    hint: 'Chạm vào phong thư để mở',
    greeting: 'Gửi em yêu,',
    paragraphs: [
      'Happy Birthday, My Love.',
      'Anh không biết phải dùng bao nhiêu lời để diễn tả em đặc biệt như thế nào đối với anh.',
      'Cảm ơn em vì đã xuất hiện trong cuộc đời anh, vì những nụ cười, những khoảnh khắc nhỏ bé và tất cả những điều tuyệt vời mà chúng ta đã cùng nhau trải qua.',
      'Anh mong rằng tuổi mới của em sẽ luôn ngập tràn hạnh phúc, bình an và những điều đẹp đẽ nhất.',
      'Và anh hy vọng mình sẽ còn được ở bên em, cùng em viết tiếp thật nhiều câu chuyện đẹp.',
    ],
    closing: 'I love you, today, tomorrow and always. ❤️',
    signature: 'Anh.',
    ps: 'P.S. Ở lại đây lâu một chút nhé, thế giới này nhỏ thôi nhưng có đủ em và anh.',
  },

  memories: {
    title: 'Our Memories',
    subtitle: 'Những mảnh ghép của chúng ta',
    hint: 'Kéo để xoay · Chạm vào ảnh để xem',
    // Thay ảnh tại: public/photos/ — giữ nguyên tên hoặc sửa src bên dưới.
    photos: [
      {
        src: '/photos/memory-1.jpg',
        caption: 'Lần đầu mình nói chuyện đến khuya',
        date: 'Mùa thu · 2022',
        note: 'Anh nhớ hôm đó mình nói đủ thứ chuyện, và anh đã mong trời đừng sáng.',
      },
      {
        src: '/photos/memory-2.jpg',
        caption: 'Chuyến đi đầu tiên của hai đứa',
        date: 'Mùa hè · 2023',
        note: 'Em cười nhiều đến mức anh chỉ muốn chụp thêm thật nhiều tấm nữa.',
      },
      {
        src: '/photos/memory-3.jpg',
        caption: 'Bữa tối không cần lý do',
        date: 'Một tối thứ Sáu',
        note: 'Điều anh thích nhất không phải món ăn, mà là em ngồi đối diện anh.',
      },
      {
        src: '/photos/memory-4.jpg',
        caption: 'Chiều mưa, chỉ có em và anh',
        date: 'Mùa mưa · 2023',
        note: 'Mưa ngoài kia rất lớn, mà trong này lại yên bình lạ thường.',
      },
      {
        src: '/photos/memory-5.jpg',
        caption: 'Nụ cười mà anh luôn nhớ',
        date: 'Một ngày rất bình thường',
        note: 'Anh không nhớ hôm đó là ngày gì. Anh chỉ nhớ em đã cười như thế.',
      },
      {
        src: '/photos/memory-6.jpg',
        caption: 'Và đây, chúng ta của hôm nay',
        date: 'Hôm nay',
        note: 'Còn rất nhiều khung hình trống phía trước, và anh muốn lấp đầy chúng cùng em.',
      },
    ],
  },

  celebration: {
    title1: 'Happy Birthday',
    title2: 'My Princess',
    subtitle: 'Một ngày mà cả thế giới nên mỉm cười',
    wishButton: 'Make a wish',
    wishHint: 'Chạm để thổi nến và ước một điều…',
    blowing: 'Đang thổi nến…',
    wishMessage: 'May all your wishes come true.',
    wishMessage2: 'I will always be here for you. ❤️',
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
    title: 'A Little Waltz for You',
    artist: 'Piano, live from the stars',
    volume: 0.42,
  },

  navigation: [
    { id: 'gift', label: 'The Gift', short: 'Gift' },
    { id: 'garden', label: 'Our Universe', short: 'Garden' },
    { id: 'letter', label: 'The Letter', short: 'Letter' },
    { id: 'memories', label: 'Our Memories', short: 'Memories' },
    { id: 'celebration', label: 'Celebration', short: 'Wish' },
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
