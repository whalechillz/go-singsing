export default function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Black+Han+Sans&family=Gothic+A1:wght@900&family=Do+Hyeon&family=Jua&display=swap"
          rel="stylesheet"
        />
      </head>
      {children}
    </>
  )
}