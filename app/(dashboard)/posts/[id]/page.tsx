export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold">Post Detail</h1>
      <p className="mt-2 text-muted-foreground">
        Viewing post {id}.
      </p>
    </div>
  )
}
