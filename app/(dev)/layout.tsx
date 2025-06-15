export default function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gothic+A1:wght@900&family=Do+Hyeon&family=Jua&family=Nanum+Gothic:wght@800&display=swap"
          rel="stylesheet"
        />
      </head>
      {children}
    </>
  )
}