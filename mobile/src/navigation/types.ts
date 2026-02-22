export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  SubjectSelect: undefined;
  TopicSelect: { subjectId: string; subjectName: string };
  Cards: { topicId?: string; topicName: string; subjectId?: string; subjectName?: string; initialFlashCardId?: string };
  Test: { topicId: string; topicName: string };
  BildirimListesi: undefined;
};

export type ProfileStackParamList = {
  Profil: undefined;
  HesapBilgileri: undefined;
  Bildirimler: undefined;
  Gizlilik: undefined;
  YardimDestek: undefined;
};
